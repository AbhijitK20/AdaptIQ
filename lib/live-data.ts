import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AdaptiveRecommendation,
  Concept,
  ConceptDependency,
  ConceptStatus,
  LearnerProfile,
  ProgramCatalogEntry,
  Question,
} from '@/lib/types'
import { notifyMasteryUpdated } from '@/lib/realtime-sync'

type SubjectRow = { id: string; name: string }
type ConceptRow = { id: string; subject_id: string; name: string; description: string | null; difficulty: number | null }
type DependencyRow = { id: string; concept_id: string; prerequisite_id: string }
type QuestionRow = {
  id: string
  concept_id: string
  question_text: string
  question_type: string
  options: unknown
  correct_answer: string
  explanation: string | null
  difficulty: number | null
}
type MasteryRow = { concept_id: string; mastery_level: number | null; status: string | null }
type CatalogProfileRow = {
  id: string
  label: string
  track_type: 'school' | 'btech'
  class_level: number | null
  branch: string | null
  semester: number | null
  preferred_subjects: string[] | null
}
type CatalogSubjectRow = { id: string; profile_id: string; name: string }
type CatalogChapterRow = { id: string; profile_id: string; subject_id: string; name: string }
type CatalogModuleRow = { id: string; profile_id: string; chapter_id: string; name: string }
type CatalogConceptRow = {
  id: string
  profile_id: string
  subject: string
  chapter: string
  module: string | null
  name: string
  description: string
  status: ConceptStatus | null
  accuracy: number | null
}
type CatalogDependencyRow = {
  id: string
  profile_id: string
  parent_concept_id: string
  child_concept_id: string
}
type CatalogQuestionRow = {
  id: string
  profile_id: string
  question_text: string
  options: unknown
  correct_answer: string
  difficulty: Question['difficulty']
  explanation: string
  concept_ids: string[] | null
  scope_type: Question['scopeType'] | null
  scope_id: string | null
  misconception_tag: string | null
  question_type: string
}
type CatalogQuizRow = {
  id: string
  profile_id: string
  scope_type: 'chapter' | 'module' | 'concept'
  scope_id: string
  question_ids: string[] | null
}
type UserCatalogMasteryRow = {
  concept_id: string
  mastery_level: number | null
  status: ConceptStatus | null
  attempts?: number | null
  correct_count?: number | null
}

const CATALOG_PAGE_SIZE = 1000

async function fetchAllCatalogRowsByProfile<T>(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  profileId: string,
): Promise<T[]> {
  const rows: T[] = []
  let from = 0

  while (true) {
    const to = from + CATALOG_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('profile_id', profileId)
      .order('id', { ascending: true })
      .range(from, to)

    if (error) throw new Error(`Failed to load ${table}: ${error.message}`)

    const batch = (data ?? []) as T[]
    rows.push(...batch)

    if (batch.length < CATALOG_PAGE_SIZE) break
    from += CATALOG_PAGE_SIZE
  }

  return rows
}

function mapDifficulty(value: number | null): Question['difficulty'] {
  const difficulty = value ?? 1
  if (difficulty >= 4) return 'hard'
  if (difficulty >= 3) return 'medium'
  return 'easy'
}

function statusFromMastery(status: string | null, masteryLevel: number): ConceptStatus {
  if (status === 'mastered') return 'mastered'
  if (status === 'weak' || status === 'in_progress') return 'weak'
  if (status === 'not_started') return 'missing'
  if (masteryLevel >= 0.8) return 'mastered'
  if (masteryLevel >= 0.5) return 'weak'
  return 'missing'
}

export async function fetchProgramFromSupabase(
  supabase: SupabaseClient,
  profile: LearnerProfile,
  userId?: string | null,
): Promise<ProgramCatalogEntry | null> {
  const [subjectsRes, conceptsRes, dependenciesRes, questionsRes] = await Promise.all([
    supabase.from('subjects').select('id,name').order('name'),
    supabase.from('concepts').select('id,subject_id,name,description,difficulty').order('name'),
    supabase.from('concept_dependencies').select('id,concept_id,prerequisite_id'),
    supabase.from('questions').select('id,concept_id,question_text,question_type,options,correct_answer,explanation,difficulty'),
  ])

  if (subjectsRes.error) throw new Error(`Failed to load subjects: ${subjectsRes.error.message}`)
  if (conceptsRes.error) throw new Error(`Failed to load concepts: ${conceptsRes.error.message}`)
  if (dependenciesRes.error) throw new Error(`Failed to load concept dependencies: ${dependenciesRes.error.message}`)
  if (questionsRes.error) throw new Error(`Failed to load questions: ${questionsRes.error.message}`)

  const subjects = (subjectsRes.data ?? []) as SubjectRow[]
  const conceptRows = (conceptsRes.data ?? []) as ConceptRow[]
  const dependencyRows = (dependenciesRes.data ?? []) as DependencyRow[]
  const questionRows = (questionsRes.data ?? []) as QuestionRow[]

  if (subjects.length === 0 || conceptRows.length === 0) return null

  let masteryRows: MasteryRow[] = []
  if (userId) {
    const masteryRes = await supabase.from('user_concept_mastery').select('concept_id,mastery_level,status').eq('user_id', userId)
    if (masteryRes.error) throw new Error(`Failed to load mastery: ${masteryRes.error.message}`)
    masteryRows = (masteryRes.data ?? []) as MasteryRow[]
  }

  const subjectNameById = new Map(subjects.map((subject) => [subject.id, subject.name]))
  const masteryByConceptId = new Map(masteryRows.map((row) => [row.concept_id, row]))

  const concepts: Concept[] = conceptRows.map((row) => {
    const mastery = masteryByConceptId.get(row.id)
    const masteryLevel = Math.max(0, Math.min(1, (mastery?.mastery_level ?? 0) / 100))
    return {
      id: row.id,
      name: row.name,
      subject: subjectNameById.get(row.subject_id) ?? 'General',
      chapter: 'General',
      description: row.description ?? '',
      accuracy: masteryLevel,
      status: statusFromMastery(mastery?.status ?? null, masteryLevel),
    }
  })

  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]))
  const conceptDependencies: ConceptDependency[] = dependencyRows
    .filter((row) => conceptById.has(row.concept_id) && conceptById.has(row.prerequisite_id))
    .map((row) => ({
      id: row.id,
      parentConceptId: row.prerequisite_id,
      childConceptId: row.concept_id,
    }))

  const questions: Question[] = questionRows
    .filter((row) => conceptById.has(row.concept_id))
    .map((row) => ({
      id: row.id,
      questionText: row.question_text,
      options: Array.isArray(row.options) ? (row.options as string[]) : [],
      correctAnswer: row.correct_answer,
      difficulty: mapDifficulty(row.difficulty),
      explanation: row.explanation ?? '',
      conceptIds: [row.concept_id],
      questionType: row.question_type === 'mcq' ? 'mcq' : 'mcq',
      scopeType: 'concept',
      scopeId: row.concept_id,
    }))

  const chapters = subjects.map((subject) => ({
    id: `${subject.id}::general`,
    name: 'General',
    subjectId: subject.id,
  }))

  return {
    profile,
    subjects: subjects.map((subject) => ({ ...subject, profileId: profile.id })),
    chapters,
    modules: [],
    concepts,
    conceptDependencies,
    questions,
    quizzes: [],
  }
}

export async function fetchCatalogProfilesFromSupabase(supabase: SupabaseClient): Promise<LearnerProfile[] | null> {
  const { data, error } = await supabase
    .from('catalog_profiles')
    .select('id,label,track_type,class_level,branch,semester,preferred_subjects')
    .order('track_type')
    .order('class_level', { ascending: true, nullsFirst: false })
    .order('semester', { ascending: true, nullsFirst: false })

  if (error) throw new Error(`Failed to load catalog profiles: ${error.message}`)
  const rows = (data ?? []) as CatalogProfileRow[]
  if (rows.length === 0) return null

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    trackType: row.track_type,
    classLevel: row.class_level ?? undefined,
    branch: (row.branch as LearnerProfile['branch']) ?? undefined,
    semester: row.semester ?? undefined,
    preferredSubjects: row.preferred_subjects ?? [],
  }))
}

export async function fetchRealtimeProgramFromCatalog(
  supabase: SupabaseClient,
  profile: LearnerProfile,
  userId?: string | null,
): Promise<ProgramCatalogEntry | null> {
  const profileId = profile.id
  const [subjectRows, chapterRows, moduleRows, conceptRows, dependencyRows, questionRows, quizRows] = await Promise.all([
    fetchAllCatalogRowsByProfile<CatalogSubjectRow>(supabase, 'catalog_subjects', 'id,profile_id,name', profileId),
    fetchAllCatalogRowsByProfile<CatalogChapterRow>(supabase, 'catalog_chapters', 'id,profile_id,subject_id,name', profileId),
    fetchAllCatalogRowsByProfile<CatalogModuleRow>(supabase, 'catalog_modules', 'id,profile_id,chapter_id,name', profileId),
    fetchAllCatalogRowsByProfile<CatalogConceptRow>(
      supabase,
      'catalog_concepts',
      'id,profile_id,subject,chapter,module,name,description,status,accuracy',
      profileId,
    ),
    fetchAllCatalogRowsByProfile<CatalogDependencyRow>(
      supabase,
      'catalog_concept_dependencies',
      'id,profile_id,parent_concept_id,child_concept_id',
      profileId,
    ),
    fetchAllCatalogRowsByProfile<CatalogQuestionRow>(
      supabase,
      'catalog_questions',
      'id,profile_id,question_text,options,correct_answer,difficulty,explanation,concept_ids,scope_type,scope_id,misconception_tag,question_type',
      profileId,
    ),
    fetchAllCatalogRowsByProfile<CatalogQuizRow>(supabase, 'catalog_quizzes', 'id,profile_id,scope_type,scope_id,question_ids', profileId),
  ])

  if (subjectRows.length === 0 || conceptRows.length === 0) return null

  let userMasteryRows: UserCatalogMasteryRow[] = []
  if (userId) {
    const masteryRes = await supabase
      .from('user_catalog_mastery')
      .select('concept_id,mastery_level,status')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
    if (masteryRes.error) throw new Error(`Failed to load user catalog mastery: ${masteryRes.error.message}`)
    userMasteryRows = (masteryRes.data ?? []) as UserCatalogMasteryRow[]
  }
  const userMasteryMap = new Map(userMasteryRows.map((row) => [row.concept_id, row]))

  const subjects = subjectRows.map((row) => ({ id: row.id, profileId, name: row.name }))
  const chapters = chapterRows.map((row) => ({ id: row.id, name: row.name, subjectId: row.subject_id }))
  const modules = moduleRows.map((row) => ({ id: row.id, name: row.name, chapterId: row.chapter_id }))
  const hasUserContext = Boolean(userId)

  const concepts: Concept[] = conceptRows.map((row) => {
    const override = userMasteryMap.get(row.id)
    const accuracy = hasUserContext
      ? (override?.mastery_level ?? 0)
      : (row.accuracy ?? 0)
    const status = hasUserContext
      ? (override?.status ?? (accuracy >= 0.8 ? 'mastered' : accuracy >= 0.5 ? 'weak' : 'missing'))
      : (row.status ?? (accuracy >= 0.8 ? 'mastered' : accuracy >= 0.5 ? 'weak' : 'missing'))
    return {
      id: row.id,
      name: row.name,
      subject: row.subject,
      chapter: row.chapter,
      module: row.module ?? undefined,
      description: row.description ?? '',
      status,
      accuracy,
    }
  })

  const conceptSet = new Set(concepts.map((concept) => concept.id))
  const conceptDependencies: ConceptDependency[] = dependencyRows
    .filter((row) => conceptSet.has(row.parent_concept_id) && conceptSet.has(row.child_concept_id))
    .map((row) => ({
      id: row.id,
      parentConceptId: row.parent_concept_id,
      childConceptId: row.child_concept_id,
    }))

  const questions: Question[] = questionRows.map((row) => ({
    id: row.id,
    questionText: row.question_text,
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    correctAnswer: row.correct_answer,
    difficulty: row.difficulty,
    explanation: row.explanation ?? '',
    conceptIds: row.concept_ids ?? [],
    scopeType: row.scope_type ?? undefined,
    scopeId: row.scope_id ?? undefined,
    misconceptionTag: row.misconception_tag ?? undefined,
    questionType: row.question_type === 'mcq' ? 'mcq' : 'mcq',
  }))

  const quizzes = quizRows.map((row) => ({
    id: row.id,
    scopeType: row.scope_type,
    scopeId: row.scope_id,
    questionIds: row.question_ids ?? [],
  }))

  return {
    profile,
    subjects,
    chapters,
    modules,
    concepts,
    conceptDependencies,
    questions,
    quizzes,
  }
}

export async function recordUserConceptAttempt(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
  conceptId: string,
  isCorrect: boolean,
) {
  const existingRes = await supabase
    .from('user_catalog_mastery')
    .select('attempts,correct_count')
    .eq('user_id', userId)
    .eq('profile_id', profileId)
    .eq('concept_id', conceptId)
    .maybeSingle()

  if (existingRes.error) {
    throw new Error(`Failed to read user catalog mastery row: ${existingRes.error.message}`)
  }

  const prevAttempts = existingRes.data?.attempts ?? 0
  const prevCorrect = existingRes.data?.correct_count ?? 0
  const attempts = prevAttempts + 1
  const correctCount = prevCorrect + (isCorrect ? 1 : 0)
  const masteryLevel = attempts > 0 ? (correctCount / attempts) : 0
  const status: ConceptStatus = masteryLevel >= 0.8 ? 'mastered' : masteryLevel >= 0.5 ? 'weak' : 'missing'

  const upsertRes = await supabase
    .from('user_catalog_mastery')
    .upsert(
      {
        user_id: userId,
        profile_id: profileId,
        concept_id: conceptId,
        mastery_level: masteryLevel,
        status,
        attempts,
        correct_count: correctCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,profile_id,concept_id' },
    )

  if (upsertRes.error) {
    throw new Error(`Failed to upsert user catalog mastery row: ${upsertRes.error.message}`)
  }

  // Dispatch real-time sync event to notify all components
  notifyMasteryUpdated({
    conceptId,
    userId,
    profileId,
    isCorrect,
  })

  return {
    conceptId,
    masteryLevel,
    status,
    attempts,
    correctCount,
  }
}

/**
 * Record a question attempt to the question_attempts table
 * This is used for tracking accuracy over time and user activity metrics
 */
export async function recordQuestionAttempt(
  supabase: SupabaseClient,
  userId: string,
  questionId: string,
  isCorrect: boolean,
  selectedAnswer: string,
  profileId?: string,
  conceptId?: string,
) {
  const insertRes = await supabase
    .from('question_attempts')
    .insert({
      user_id: userId,
      question_id: questionId,
      is_correct: isCorrect,
      selected_answer: selectedAnswer,
      created_at: new Date().toISOString(),
    })

  if (insertRes.error) {
    console.error('Failed to insert question attempt:', insertRes.error.message)
    // Don't throw - this is non-critical for UX
  }

  return { questionId, isCorrect }
}

/**
 * Start a new practice session
 */
export async function startPracticeSession(
  supabase: SupabaseClient,
  userId: string,
  conceptId?: string,
): Promise<string | null> {
  const insertRes = await supabase
    .from('practice_sessions')
    .insert({
      user_id: userId,
      concept_id: conceptId,
      started_at: new Date().toISOString(),
      status: 'active',
      questions_attempted: 0,
      correct_answers: 0,
    })
    .select('id')
    .single()

  if (insertRes.error) {
    console.error('Failed to start practice session:', insertRes.error.message)
    return null
  }

  return insertRes.data?.id ?? null
}

/**
 * Update practice session with progress
 */
export async function updatePracticeSession(
  supabase: SupabaseClient,
  sessionId: string,
  questionsAttempted: number,
  correctAnswers: number,
) {
  const updateRes = await supabase
    .from('practice_sessions')
    .update({
      questions_attempted: questionsAttempted,
      correct_answers: correctAnswers,
    })
    .eq('id', sessionId)

  if (updateRes.error) {
    console.error('Failed to update practice session:', updateRes.error.message)
  }
}

/**
 * End a practice session
 */
export async function endPracticeSession(
  supabase: SupabaseClient,
  sessionId: string,
  questionsAttempted: number,
  correctAnswers: number,
) {
  const updateRes = await supabase
    .from('practice_sessions')
    .update({
      ended_at: new Date().toISOString(),
      status: 'completed',
      questions_attempted: questionsAttempted,
      correct_answers: correctAnswers,
    })
    .eq('id', sessionId)

  if (updateRes.error) {
    console.error('Failed to end practice session:', updateRes.error.message)
  }
}

export function getProgressStatsFromConcepts(concepts: Concept[]) {
  const total = concepts.length
  if (total === 0) {
    return {
      total: 0,
      mastered: 0,
      weak: 0,
      missing: 0,
      avgAccuracy: 0,
      masteredPercent: 0,
      weakPercent: 0,
      missingPercent: 0,
    }
  }

  const mastered = concepts.filter((concept) => concept.status === 'mastered').length
  const weak = concepts.filter((concept) => concept.status === 'weak').length
  const missing = concepts.filter((concept) => concept.status === 'missing').length
  const avgAccuracy = concepts.reduce((sum, concept) => sum + (concept.accuracy ?? 0), 0) / total

  return {
    total,
    mastered,
    weak,
    missing,
    avgAccuracy,
    masteredPercent: Math.round((mastered / total) * 100),
    weakPercent: Math.round((weak / total) * 100),
    missingPercent: Math.round((missing / total) * 100),
  }
}

export function getWeakConceptsFromConcepts(concepts: Concept[]) {
  return concepts
    .filter((concept) => concept.status === 'weak' || concept.status === 'missing')
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))
}

export function getSuggestedConceptFromConcepts(concepts: Concept[]) {
  const weakConcepts = getWeakConceptsFromConcepts(concepts)
  return weakConcepts.length > 0 ? weakConcepts[0] : null
}

export function getAdaptiveRecommendationFromProgram(
  concepts: Concept[],
  dependencies: ConceptDependency[],
): AdaptiveRecommendation | null {
  const conceptMap = new Map(concepts.map((concept) => [concept.id, concept]))
  const missingPrerequisite = dependencies
    .map((dependency) => conceptMap.get(dependency.parentConceptId))
    .find((concept) => concept?.status === 'missing')
  if (missingPrerequisite) {
    return { concept: missingPrerequisite, reason: 'missing-prerequisite' }
  }

  const weakConcept = concepts
    .filter((concept) => concept.status === 'weak')
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))[0]
  if (weakConcept) {
    return { concept: weakConcept, reason: 'weak-concept' }
  }

  const nextUnlocked = concepts.find((concept) => concept.status !== 'mastered')
  if (nextUnlocked) {
    return { concept: nextUnlocked, reason: 'next-unlocked' }
  }

  return null
}

export function diagnoseErrorFromProgram(
  questionId: string,
  questions: Question[],
  concepts: Concept[],
  dependencies: ConceptDependency[],
) {
  const question = questions.find((item) => item.id === questionId)
  if (!question) return null

  const relatedConcepts = question.conceptIds
    .map((conceptId) => concepts.find((concept) => concept.id === conceptId))
    .filter((concept): concept is Concept => concept !== undefined)

  const weakestConcept =
    relatedConcepts.find((concept) => concept.status === 'missing' || concept.status === 'weak') ??
    relatedConcepts[0]
  if (!weakestConcept) return null

  const chain = dependencies
    .filter((dependency) => dependency.childConceptId === weakestConcept.id)
    .map((dependency) => concepts.find((concept) => concept.id === dependency.parentConceptId))
    .filter((concept): concept is Concept => concept !== undefined)

  return {
    missingConcept: weakestConcept,
    chain,
    suggestion:
      chain.length > 0
        ? `Focus on strengthening "${weakestConcept.name}" by first reviewing ${chain.map((concept) => `"${concept.name}"`).join(' and ')}.`
        : `Focus on strengthening "${weakestConcept.name}" and review its concept flow in the knowledge map.`,
  }
}

