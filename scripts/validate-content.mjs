const data = await import('../lib/data.ts')

const {
  getAvailableProfiles,
  getActiveProgram,
} = data

function validateProgram(program) {
  const errors = []

  const subjectIds = new Set(program.subjects.map((subject) => subject.id))
  const chapterIds = new Set(program.chapters.map((chapter) => chapter.id))
  const moduleIds = new Set(program.modules.map((module) => module.id))
  const conceptIds = new Set(program.concepts.map((concept) => concept.id))
  const questionIds = new Set(program.questions.map((question) => question.id))

  for (const chapter of program.chapters) {
    if (!subjectIds.has(chapter.subjectId)) {
      errors.push(`Chapter ${chapter.id} references missing subject ${chapter.subjectId}`)
    }
  }

  for (const module of program.modules) {
    if (!chapterIds.has(module.chapterId)) {
      errors.push(`Module ${module.id} references missing chapter ${module.chapterId}`)
    }
  }

  for (const dependency of program.conceptDependencies) {
    if (!conceptIds.has(dependency.parentConceptId)) {
      errors.push(`Dependency ${dependency.id} has missing parent concept ${dependency.parentConceptId}`)
    }
    if (!conceptIds.has(dependency.childConceptId)) {
      errors.push(`Dependency ${dependency.id} has missing child concept ${dependency.childConceptId}`)
    }
  }

  for (const question of program.questions) {
    for (const conceptId of question.conceptIds) {
      if (!conceptIds.has(conceptId)) {
        errors.push(`Question ${question.id} references missing concept ${conceptId}`)
      }
    }
  }

  for (const quiz of program.quizzes) {
    for (const questionId of quiz.questionIds) {
      if (!questionIds.has(questionId)) {
        errors.push(`Quiz ${quiz.id} references missing question ${questionId}`)
      }
    }

    if (quiz.scopeType === 'chapter' && !chapterIds.has(quiz.scopeId)) {
      errors.push(`Quiz ${quiz.id} references missing chapter scope ${quiz.scopeId}`)
    }
    if (quiz.scopeType === 'module' && !moduleIds.has(quiz.scopeId)) {
      errors.push(`Quiz ${quiz.id} references missing module scope ${quiz.scopeId}`)
    }
    if (quiz.scopeType === 'concept' && !conceptIds.has(quiz.scopeId)) {
      errors.push(`Quiz ${quiz.id} references missing concept scope ${quiz.scopeId}`)
    }
  }

  return errors
}

const allProfiles = getAvailableProfiles()
let hasErrors = false

for (const profile of allProfiles) {
  const program = getActiveProgram(profile.id)
  const errors = validateProgram(program)
  if (errors.length > 0) {
    hasErrors = true
    console.error(`\n[${profile.id}] content validation failed:`)
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
  }
}

if (hasErrors) {
  process.exit(1)
}

console.log(`Validated ${allProfiles.length} profiles successfully.`)
