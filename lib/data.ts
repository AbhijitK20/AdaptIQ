import type {
  AdaptiveRecommendation,
  Chapter,
  Concept,
  ConceptDependency,
  GraphEdge,
  GraphNode,
  LearnerProfile,
  MasteryState,
  Module,
  ProgramCatalogEntry,
  Question,
  Quiz,
  Subject,
  UserConceptProgress,
} from './types'

const SCHOOL_SUBJECTS = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'English', 'Social Science'] as const
const BTECH_BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'] as const
const BTECH_CORE_SUBJECTS = ['Engineering Mathematics', 'Engineering Physics', 'Basic Electrical', 'Programming Fundamentals'] as const

const SCHOOL_DEFAULT_CHAPTERS = ['Foundations of the Subject', 'Core Principles', 'Applied Learning'] as const

const SCHOOL_SYLLABUS: Record<number, Record<string, string[]>> = {
  5: {
    Mathematics: [
      'Numbers and Place Value',
      'Addition and Subtraction',
      'Multiplication and Division',
      'Fractions',
      'Decimals',
      'Geometry Basics',
      'Perimeter and Area',
      'Data Handling',
    ],
    Science: [
      'Plants Around Us',
      'Animals and Their Habitats',
      'Human Body and Health',
      'Food and Nutrition',
      'States of Matter',
      'Force and Motion Basics',
      'Light and Shadows',
      'Water and Air',
    ],
    'Social Science': [
      'Our Earth and Maps',
      'India: Location and Diversity',
      'Early Human Life',
      'Ancient Civilizations',
      'Our Government',
      'Rights and Duties',
      'Resources and Occupations',
      'Transport and Communication',
    ],
    English: [
      'Ice-cream Man',
      'Wonderful Waste',
      'Teamwork',
      'Flying Together',
      'My Shadow',
      'Robinson Crusoe Discovers a Footprint',
      'Crying',
    ],
    Hindi: [
      'राख की रस्सी',
      'फसलों का त्योहार',
      'खिलौनेवाला',
      'नन्हा फनकार',
      'जहाँ चाह वहाँ राह',
      'चींटी और कबूतर',
    ],
  },
  6: {
    Mathematics: ['Patterns in Mathematics', 'Lines and Angles', 'Data Handling', 'Prime Time', 'Perimeter and Area', 'Fractions', 'Integers', 'Algebra Basics', 'Ratio and Proportion'],
    Science: ['Components of Food', 'Sorting Materials into Groups', 'Separation of Substances', 'Getting to Know Plants', 'Body Movements', 'Motion and Measurement of Distances', 'Light, Shadows and Reflection', 'Electricity and Circuits', 'Water', 'Air around Us'],
    'Social Science': [
      'Locating Places on the Earth',
      'Oceans and Continents',
      'Landforms and Life',
      'Timeline and Sources of History',
      'The Beginnings of Indian Civilisation',
      'Indias Cultural Roots',
      'Family and Community',
      'Grassroots Democracy',
    ],
    English: [
      'A Bottle of Dew',
      'The Raven and The Fox',
      'Rama to the Rescue',
      'The Unlikely Best Friends',
      'Neem Baba',
      'Yoga — A Way of Life',
      'Hamara Bharat — Incredible India',
    ],
    Hindi: [
      'वह चिड़िया जो',
      'बचपन',
      'नादान दोस्त',
      'चाँद से थोड़ी-सी गप्पें',
      'अक्षरों का महत्त्व',
      'पार नज़र के',
    ],
  },
  7: {
    Mathematics: ['Rational Numbers', 'Simple Equations', 'The Triangle and Its Properties', 'Comparing Quantities', 'Algebraic Expressions', 'Exponents and Powers', 'Perimeter and Area', 'Data Handling'],
    Science: ['Nutrition in Plants and Animals', 'Heat', 'Acids, Bases and Salts', 'Physical and Chemical Changes', 'Respiration in Organisms', 'Motion and Time', 'Electric Current and Its Effects', 'Light'],
    'Social Science': [
      'On Equality',
      'Role of the Government in Health',
      'How the State Government Works',
      'Growing Up as Boys and Girls',
      'The Delhi Sultans',
      'The Mughal Empire',
      'Towns, Traders and Craftspersons',
      'Environment',
      'Inside Our Earth',
    ],
    English: [
      'Three Questions',
      'A Gift of Chappals',
      'Gopal and the Hilsa Fish',
      'The Ashes That Made Trees Bloom',
      'Quality',
      'Expert Detectives',
      'The Invention of Vita-Wonk',
    ],
    Hindi: [
      'हम पंछी उन्मुक्त गगन के',
      'दादी माँ',
      'हिमालय की बेटियाँ',
      'मिठाईवाला',
      'पापा खो गए',
      'संध्या के बाद',
    ],
  },
  8: {
    Mathematics: ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Squares and Square Roots', 'Algebraic Expressions and Identities', 'Mensuration', 'Factorisation', 'Introduction to Graphs'],
    Science: ['Metals and Non-metals', 'Coal and Petroleum', 'Cell Structure and Functions', 'Reproduction in Animals', 'Force and Pressure', 'Friction', 'Sound', 'Light', 'Chemical Effects of Electric Current'],
    'Social Science': [
      'The Indian Constitution',
      'Parliament and the Making of Laws',
      'Judiciary',
      'From Trade to Territory',
      'When People Rebel 1857 and After',
      'Civilising the Native, Educating the Nation',
      'Resources',
      'Agriculture',
      'Industries',
    ],
    English: [
      'The Best Christmas Present in the World',
      'The Tsunami',
      'Glimpses of the Past',
      'Bepin Choudhurys Lapse of Memory',
      'The Summit Within',
      'This is Jodys Fawn',
      'A Visit to Cambridge',
    ],
    Hindi: [
      'ध्वनि',
      'लाख की चूड़ियाँ',
      'बस की यात्रा',
      'दीवानों की हस्ती',
      'भगवान के डाकिए',
      'क्या निराश हुआ जाए',
    ],
  },
  9: {
    Mathematics: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Triangles', 'Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    Science: ['Matter in Our Surroundings', 'Atoms and Molecules', 'Structure of the Atom', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound'],
    'Social Science': [
      'The French Revolution',
      'Socialism in Europe and the Russian Revolution',
      'Nazism and the Rise of Hitler',
      'What is Democracy? Why Democracy?',
      'Constitutional Design',
      'Electoral Politics',
      'India — Size and Location',
      'Physical Features of India',
      'Drainage',
    ],
    English: [
      'The Fun They Had',
      'The Sound of Music',
      'The Little Girl',
      'A Truly Beautiful Mind',
      'The Snake and the Mirror',
      'My Childhood',
      'Packing',
    ],
    Hindi: [
      'दो बैलों की कथा',
      'ल्हासा की ओर',
      'उपभोक्तावाद की संस्कृति',
      'साँवले सपनों की याद',
      'प्रेमचंद के फटे जूते',
      'मेरे बचपन के दिन',
    ],
  },
  10: {
    Mathematics: ['Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Trigonometry', 'Coordinate Geometry', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    Science: ['Chemical Reactions and Equations', 'Metals and Non-metals', 'Carbon and Its Compounds', 'Life Processes', 'Light Reflection and Refraction', 'Electricity', 'Magnetic Effects of Electric Current'],
    'Social Science': [
      'The Rise of Nationalism in Europe',
      'Nationalism in India',
      'Resources and Development',
      'Forest and Wildlife Resources',
      'Water Resources',
      'Power Sharing',
      'Federalism',
      'Political Parties',
      'Outcomes of Democracy',
    ],
    English: [
      'A Letter to God',
      'Nelson Mandela: Long Walk to Freedom',
      'Two Stories About Flying',
      'From the Diary of Anne Frank',
      'Glimpses of India',
      'Mijbil the Otter',
      'Madam Rides the Bus',
    ],
    Hindi: [
      'साखी',
      'पद',
      'आत्मकथ्य',
      'उत्साह और अट नहीं रही',
      'यह दंतुरित मुस्कान',
      'संगतकार',
    ],
  },
  11: {
    Mathematics: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Complex Numbers', 'Permutations and Combinations', 'Sequences and Series', 'Conic Sections', 'Limits and Derivatives', 'Probability'],
    Physics: ['Units and Measurements', 'Motion in a Straight Line', 'Laws of Motion', 'Work Energy and Power', 'Rotational Motion', 'Gravitation', 'Thermodynamics', 'Oscillations', 'Waves'],
    Chemistry: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Organic Chemistry Basics', 'Hydrocarbons'],
    Biology: ['Cell The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Photosynthesis', 'Respiration in Plants', 'Digestion and Absorption', 'Neural Control and Coordination'],
  },
  12: {
    Mathematics: ['Relations and Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'],
    Physics: ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Electromagnetic Induction', 'Alternating Current', 'Ray Optics', 'Wave Optics', 'Semiconductor Electronics'],
    Chemistry: ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols Phenols and Ethers', 'Aldehydes Ketones and Carboxylic Acids', 'Amines', 'Biomolecules', 'Polymers'],
    Biology: ['Reproduction in Organisms', 'Human Reproduction', 'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution', 'Biotechnology Principles and Processes', 'Biotechnology Applications', 'Ecosystem', 'Biodiversity and Conservation'],
  },
}

const BTECH_SYLLABUS: Record<(typeof BTECH_BRANCHES)[number], Record<number, string[]>> = {
  CSE: {
    1: ['Applied Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Programming for Problem Solving', 'Basic Electrical and Electronics'],
    2: ['Applied Mathematics II', 'Engineering Graphics', 'Data Structures Foundations', 'Digital Logic Fundamentals', 'Workshop Practice'],
    3: ['Discrete Mathematics', 'Data Structures and Algorithms', 'Computer Organization and Architecture', 'Object Oriented Programming'],
    4: ['Design and Analysis of Algorithms', 'Theory of Computation', 'Database Management Systems', 'Operating Systems'],
    5: ['Computer Networks', 'Software Engineering', 'Compiler Design', 'Web Technologies'],
    6: ['Artificial Intelligence', 'Machine Learning Basics', 'Distributed Systems', 'Cloud Computing'],
    7: ['Cyber Security', 'Big Data Analytics', 'Professional Elective I', 'Open Elective I'],
    8: ['Professional Elective II', 'Open Elective II', 'Project Work'],
  },
  IT: {
    1: ['Applied Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Programming for Problem Solving', 'Basic Electrical and Electronics'],
    2: ['Applied Mathematics II', 'Data Structures Foundations', 'Web Fundamentals', 'Engineering Graphics'],
    3: ['Discrete Mathematics', 'Data Structures', 'Computer Organization', 'Full Stack Web Programming'],
    4: ['Design and Analysis of Algorithms', 'Operating Systems', 'Database Systems', 'Theory of Computation Basics'],
    5: ['Computer Networks', 'Information Security', 'Entrepreneurship and E-business', 'DevOps Laboratory'],
    6: ['Cloud and Virtualization', 'Data Analytics', 'Mobile Application Development', 'Professional Elective I'],
    7: ['Cyber Physical Systems', 'Advanced Data Analytics', 'Professional Elective II', 'Open Elective I'],
    8: ['Professional Elective III', 'Open Elective II', 'Project Work'],
  },
  ME: {
    1: ['Applied Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electrical and Electronics', 'Workshop Practice'],
    2: ['Applied Mathematics II', 'Engineering Mechanics', 'Engineering Graphics', 'Programming for Problem Solving'],
    3: ['Engineering Thermodynamics', 'Strength of Materials', 'Manufacturing Processes I', 'Material Science'],
    4: ['Fluid Mechanics and Hydraulic Machines', 'Kinematics of Machines', 'Manufacturing Processes II', 'Metrology and Measurements'],
    5: ['Design of Machine Elements', 'Heat and Mass Transfer', 'Dynamics of Machines', 'Industrial Engineering'],
    6: ['CAD CAM and Mechatronics', 'Finite Element Methods', 'IC Engines and Gas Turbines', 'Professional Elective I'],
    7: ['Design of Mechanical Systems', 'Machinery Diagnostics', 'Professional Elective II', 'Open Elective I'],
    8: ['Professional Elective III', 'Open Elective II', 'Project Work'],
  },
  CIVIL: {
    1: ['Applied Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Engineering Graphics', 'Workshop Practice'],
    2: ['Applied Mathematics II', 'Engineering Mechanics', 'Basic Electrical and Electronics', 'Programming for Problem Solving'],
    3: ['Solid Mechanics', 'Surveying and Geomatics', 'Building Materials and Construction', 'Fluid Mechanics'],
    4: ['Structural Analysis', 'Geotechnical Engineering', 'Hydrology and Water Resources', 'Transportation Engineering I'],
    5: ['Reinforced Concrete Design', 'Steel Structure Design', 'Environmental Engineering', 'Transportation Engineering II'],
    6: ['Foundation Engineering', 'Construction Planning and Management', 'Quantity Surveying and Estimation', 'Professional Elective I'],
    7: ['Advanced Structural Engineering', 'Construction Engineering and Management', 'Professional Elective II', 'Open Elective I'],
    8: ['Professional Elective III', 'Open Elective II', 'Project Work'],
  },
  ECE: {
    1: ['Applied Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electrical and Electronics', 'Programming for Problem Solving'],
    2: ['Applied Mathematics II', 'Electronic Devices Basics', 'Digital Logic Fundamentals', 'Engineering Graphics'],
    3: ['Electronic Devices and Analog Circuits', 'Digital System Design', 'Signals and Systems', 'Network Theory'],
    4: ['Microcontrollers', 'Probability and Stochastic Processes', 'Control Systems', 'Electromagnetic Theory'],
    5: ['Digital Signal Processing', 'Information Theory and Coding', 'Analog Communication', 'VLSI Fundamentals'],
    6: ['Digital Communication', 'Antenna and Wave Propagation', 'Embedded Systems', 'Professional Elective I'],
    7: ['VLSI Design', 'Optical Communication', 'Wireless Communication', 'Professional Elective II'],
    8: ['Professional Elective III', 'Open Elective I', 'Project Work'],
  },
  EEE: {
    1: ['Applied Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Basic Electrical and Electronics', 'Programming for Problem Solving'],
    2: ['Applied Mathematics II', 'Engineering Graphics', 'Electrical Circuit Analysis', 'Workshop Practice'],
    3: ['Electrical Machines I', 'Network Analysis', 'Analog Electronics', 'Electromagnetic Fields'],
    4: ['Electrical Machines II', 'Power Systems I', 'Control Systems', 'Digital Electronics'],
    5: ['Power Electronics', 'Power Systems II', 'Microprocessors and Microcontrollers', 'Measurement and Instrumentation'],
    6: ['Electrical Drives', 'Renewable Energy Systems', 'Switchgear and Protection', 'Professional Elective I'],
    7: ['High Voltage Engineering', 'Smart Grid Technologies', 'Professional Elective II', 'Open Elective I'],
    8: ['Professional Elective III', 'Open Elective II', 'Project Work'],
  },
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function chapterToken(chapterName: string) {
  return chapterName
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .find((part) => part.length > 3)
}

function buildSchoolModules(subjectName: string, chapterName: string): [string, string, string] {
  const lower = `${subjectName} ${chapterName}`.toLowerCase()

  if (includesAny(lower, ['patterns in mathematics', 'patterns'])) {
    return ['Number and Shape Patterns', 'Pattern Rules and Generalization', 'Pattern-Based Problem Solving']
  }
  if (includesAny(lower, ['lines and angles'])) {
    return ['Basic Geometrical Ideas', 'Types of Angles and Pairs', 'Drawing and Measuring Angles']
  }
  if (includesAny(lower, ['prime time', 'prime', 'composite', 'hcf', 'lcm'])) {
    return ['Factors, Multiples and Divisibility', 'Prime and Composite Numbers', 'HCF and LCM Applications']
  }
  if (includesAny(lower, ['perimeter and area', 'mensuration'])) {
    return ['Perimeter of 2D Shapes', 'Area of Rectangles and Squares', 'Word Problems in Mensuration']
  }
  if (includesAny(lower, ['fractions'])) {
    return ['Equivalent and Simplified Fractions', 'Operations on Fractions', 'Real-Life Fraction Problems']
  }
  if (includesAny(lower, ['integers'])) {
    return ['Integers on Number Line', 'Addition and Subtraction of Integers', 'Integer Applications']
  }
  if (includesAny(lower, ['ratio and proportion'])) {
    return ['Understanding Ratio', 'Equivalent Ratios and Proportion', 'Daily-Life Ratio Problems']
  }
  if (includesAny(lower, ['data handling'])) {
    return ['Collecting and Organizing Data', 'Pictographs and Bar Graphs', 'Interpreting Data and Conclusions']
  }
  if (includesAny(lower, ['components of food'])) {
    return ['Nutrients and Their Functions', 'Balanced Diet and Deficiency Diseases', 'Food Sources and Testing']
  }
  if (includesAny(lower, ['sorting materials', 'separation of substances'])) {
    return ['Properties of Materials', 'Methods of Separation', 'Practical Separation Activities']
  }
  if (includesAny(lower, ['motion and measurement'])) {
    return ['Units and Measuring Instruments', 'Types of Motion', 'Distance-Time Applications']
  }
  if (includesAny(lower, ['light, shadows and reflection'])) {
    return ['Sources of Light and Shadows', 'Reflection and Mirror Basics', 'Pinhole Camera and Applications']
  }
  if (includesAny(lower, ['electricity and circuits'])) {
    return ['Electric Cell and Circuit Components', 'Conductors and Insulators', 'Circuit Safety and Applications']
  }
  if (includesAny(lower, ['water', 'air around us'])) {
    return ['Composition and Properties', 'Water Cycle and Atmosphere', 'Conservation and Everyday Use']
  }
  if (includesAny(lower, ['getting to know plants', 'body movements'])) {
    return ['Structure and Classification', 'Functions and Adaptations', 'Observation and Activity-Based Learning']
  }
  if (includesAny(lower, ['sets'])) {
    return ['Set Representation and Types', 'Operations on Sets and Venn Diagrams', 'Applications of Set Theory']
  }
  if (includesAny(lower, ['relations and functions', 'relations', 'functions'])) {
    return ['Relations and Mapping Basics', 'Function Types and Composition', 'Domain-Range and Inverse Analysis']
  }
  if (includesAny(lower, ['complex numbers'])) {
    return ['Algebra of Complex Numbers', 'Argand Plane and Modulus', 'Quadratic Applications']
  }
  if (includesAny(lower, ['permutations and combinations'])) {
    return ['Fundamental Counting Principle', 'Permutations and Arrangements', 'Combinations and Selection Problems']
  }
  if (includesAny(lower, ['conic sections'])) {
    return ['Circle and Parabola Basics', 'Ellipse and Hyperbola', 'Conic Applications and Problems']
  }
  if (includesAny(lower, ['limits and derivatives', 'continuity and differentiability', 'application of derivatives'])) {
    return ['Limits and Continuity', 'Differentiation Rules and Methods', 'Applications of Derivatives']
  }
  if (includesAny(lower, ['matrices'])) {
    return ['Matrix Types and Operations', 'Inverse of Matrix', 'Applications of Matrices']
  }
  if (includesAny(lower, ['determinants'])) {
    return ['Determinant Properties', 'Minor, Cofactor and Expansion', 'Determinants in Solving Equations']
  }
  if (includesAny(lower, ['integrals', 'application of integrals'])) {
    return ['Indefinite and Definite Integrals', 'Techniques of Integration', 'Area and Real Applications']
  }
  if (includesAny(lower, ['differential equations'])) {
    return ['Order and Degree', 'Methods of Solving Differential Equations', 'Applications in Growth and Decay']
  }
  if (includesAny(lower, ['vector algebra', 'three dimensional geometry'])) {
    return ['Vector Basics and Operations', 'Direction Cosines and Lines', 'Planes and 3D Applications']
  }
  if (includesAny(lower, ['linear programming'])) {
    return ['Formulating LPP', 'Graphical Method', 'Optimization in Practical Cases']
  }
  if (includesAny(lower, ['units and measurements'])) {
    return ['SI Units and Dimensions', 'Measurement Errors', 'Significant Figures and Precision']
  }
  if (includesAny(lower, ['motion in a straight line', 'motion in a plane'])) {
    return ['Kinematics Equations', 'Vectors in Motion', 'Graphical Interpretation and Problems']
  }
  if (includesAny(lower, ['laws of motion', 'work energy and power', 'gravitation'])) {
    return ["Newton's Laws and Dynamics", 'Work-Energy Theorem and Power', 'Universal Gravitation and Applications']
  }
  if (includesAny(lower, ['oscillations', 'waves', 'ray optics', 'wave optics'])) {
    return ['Wave and Oscillation Parameters', 'Interference, Diffraction and Optics', 'Numericals and Applications']
  }
  if (includesAny(lower, ['electrostatic', 'current electricity', 'moving charges and magnetism', 'electromagnetic'])) {
    return ['Field and Potential Concepts', 'Circuit and Magnetic Effects', 'Electromagnetic Applications']
  }
  if (includesAny(lower, ['structure of atom', 'chemical bonding', 'equilibrium', 'electrochemistry', 'chemical kinetics'])) {
    return ['Atomic and Molecular Basics', 'Reactions and Equilibrium', 'Numericals and Chemical Applications']
  }
  if (includesAny(lower, ['biomolecules', 'cell', 'inheritance', 'evolution', 'biotechnology'])) {
    return ['Core Biological Concepts', 'Mechanisms and Processes', 'Applications in Health and Environment']
  }

  if (includesAny(lower, ['rational numbers'])) {
    return ['Representation and Comparison', 'Operations on Rational Numbers', 'Real-Life Applications of Rational Numbers']
  }
  if (includesAny(lower, ['simple equations', 'linear equations'])) {
    return ['Forming Algebraic Equations', 'Solving One-Variable Equations', 'Word Problems using Equations']
  }
  if (includesAny(lower, ['triangle and its properties', 'triangles'])) {
    return ['Angles and Sides Relationships', 'Triangle Construction and Congruence', 'Applications and Proof-Based Problems']
  }
  if (includesAny(lower, ['comparing quantities', 'ratio', 'proportion', 'percentage'])) {
    return ['Ratio, Proportion and Percentage', 'Profit, Loss and Discount', 'Simple Interest and Practical Cases']
  }
  if (includesAny(lower, ['data handling', 'statistics'])) {
    return ['Data Collection and Tabulation', 'Graphs and Interpretation', 'Mean, Median and Practical Analysis']
  }
  if (includesAny(lower, ['on equality', 'government', 'democracy', 'constitution'])) {
    return ['Core Ideas and Institutions', 'Case Studies and Governance Processes', 'Civic Participation and Evaluation']
  }
  if (includesAny(lower, ['mughal', 'sultans', 'revolution', 'nationalism', 'history'])) {
    return ['Timeline, Sources and Context', 'Key Events and Personalities', 'Historical Interpretation and Debates']
  }
  if (includesAny(lower, ['english', 'poem', 'story', 'letter', 'diary'])) {
    return ['Reading and Comprehension', 'Vocabulary and Literary Devices', 'Writing and Contextual Interpretation']
  }
  if (includesAny(lower, ['हिंदी', 'कथा', 'कविता', 'पद', 'साखी', 'बचपन', 'मिठाईवाला'])) {
    return ['पाठ बोध और शब्दार्थ', 'व्याकरण और अभिव्यक्ति', 'लेखन, मूल्यांकन और अनुप्रयोग']
  }
  if (includesAny(lower, ['electricity', 'electric current', 'magnetic'])) {
    return ['Current and Charge', "Ohm's Law and Circuit Relations", 'Household Circuits and Safety']
  }
  if (includesAny(lower, ['light', 'optics', 'reflection', 'refraction'])) {
    return ['Ray Behavior and Reflection', 'Refraction and Optical Media', 'Lenses and Real-World Optics']
  }
  if (includesAny(lower, ['force', 'motion', 'laws of motion', 'gravitation'])) {
    return ['Kinematics Foundations', "Newton's Laws and Dynamics", 'Numericals and Everyday Motion']
  }
  if (includesAny(lower, ['trigonometry', 'triangle'])) {
    return ['Trigonometric Ratios and Identities', 'Heights, Distances and Applications', 'Mixed Trigonometry Problems']
  }
  if (includesAny(lower, ['polynomial', 'algebra', 'equation'])) {
    return ['Expressions and Algebraic Forms', 'Equation Solving Techniques', 'Word Problems and Applications']
  }
  if (includesAny(lower, ['statistics', 'probability', 'data handling'])) {
    return ['Data Representation and Measures', 'Experiments and Probability Models', 'Interpretation and Case Problems']
  }
  if (includesAny(lower, ['cell', 'biomolecule', 'reproduction', 'inheritance', 'evolution'])) {
    return ['Biological Structures and Terms', 'Processes and Mechanisms', 'Applications in Health and Environment']
  }
  if (includesAny(lower, ['thermodynamics', 'heat', 'energy'])) {
    return ['Heat and Energy Fundamentals', 'Laws and Process Analysis', 'Numericals and Engineering Contexts']
  }
  if (includesAny(lower, ['chemistry', 'chemical', 'reaction', 'compound', 'electrochemistry'])) {
    return ['Core Chemical Concepts', 'Reactions and Mechanisms', 'Quantitative and Applied Chemistry']
  }

  const token = chapterToken(chapterName) || 'Topic'
  return [
    `${token} Fundamentals`,
    `${token} Problem Solving`,
    `${token} Applications`,
  ]
}

function buildBtechChapters(subjectName: string): [string, string, string] {
  const lower = subjectName.toLowerCase()

  if (includesAny(lower, ['mathematics', 'numerical'])) {
    return ['Calculus and Differential Equations', 'Matrices, Transforms and Vector Methods', 'Probability, Statistics and Applications']
  }
  if (includesAny(lower, ['physics'])) {
    return ['Mechanics and Waves', 'Electromagnetism and Optics', 'Modern Physics and Engineering Applications']
  }
  if (includesAny(lower, ['chemistry'])) {
    return ['Atomic Structure and Bonding', 'Thermodynamics, Kinetics and Equilibrium', 'Materials, Polymers and Engineering Chemistry']
  }
  if (includesAny(lower, ['programming', 'object oriented'])) {
    return ['Problem Solving and Algorithms', 'Language Fundamentals and Data Types', 'Functions, Files and Modular Design']
  }
  if (includesAny(lower, ['data structures'])) {
    return ['Linear Data Structures', 'Trees, Graphs and Hashing', 'Complexity and Optimization']
  }
  if (includesAny(lower, ['algorithm'])) {
    return ['Algorithm Design Paradigms', 'Greedy, DP and Graph Algorithms', 'Complexity, Correctness and NP Concepts']
  }
  if (includesAny(lower, ['operating systems'])) {
    return ['Processes, Threads and Scheduling', 'Memory and Virtualization', 'File Systems, I/O and Protection']
  }
  if (includesAny(lower, ['database'])) {
    return ['ER Modeling and Relational Algebra', 'SQL, Transactions and Normalization', 'Indexing, Optimization and Practice']
  }
  if (includesAny(lower, ['computer networks', 'network theory', 'network analysis'])) {
    return ['Signals, Layers and Protocol Foundations', 'Routing, Switching and Addressing', 'Transport, Security and Applications']
  }
  if (includesAny(lower, ['digital logic', 'digital system', 'digital electronics'])) {
    return ['Boolean Algebra and Combinational Logic', 'Sequential Circuits and Timing', 'Design Problems and Implementation']
  }
  if (includesAny(lower, ['microcontroller', 'microprocessor'])) {
    return ['Architecture and Instruction Set', 'Interfacing and Peripherals', 'Embedded Programming and Applications']
  }
  if (includesAny(lower, ['machine learning', 'artificial intelligence', 'data analytics', 'big data'])) {
    return ['Core Models and Representations', 'Training, Evaluation and Optimization', 'Practical Pipelines and Case Studies']
  }
  if (includesAny(lower, ['cloud', 'distributed', 'devops'])) {
    return ['Virtualization and Service Models', 'Distributed Design and Scalability', 'Deployment, Monitoring and Reliability']
  }
  if (includesAny(lower, ['thermodynamics', 'heat', 'mass transfer'])) {
    return ['System Properties and Laws', 'Energy Conversion and Cycles', 'Design Calculations and Applications']
  }
  if (includesAny(lower, ['mechanics', 'strength', 'dynamics', 'kinematics'])) {
    return ['Force Systems and Equilibrium', 'Stress, Strain and Deformation', 'Machine Elements and Dynamics']
  }
  if (includesAny(lower, ['manufacturing', 'workshop', 'metrology', 'cad', 'cam'])) {
    return ['Processes, Tools and Materials', 'Measurement, Tolerances and Quality', 'Automation, CNC and Design Practice']
  }
  if (includesAny(lower, ['surveying', 'geomatics', 'transportation', 'construction'])) {
    return ['Field Methods and Geometric Design', 'Estimation, Planning and Standards', 'Project Cases and Site Execution']
  }
  if (includesAny(lower, ['structural', 'concrete', 'steel', 'foundation', 'geotechnical'])) {
    return ['Material Behavior and Structural Forms', 'Design Methods and Codes', 'Load Cases, Stability and Detailing']
  }
  if (includesAny(lower, ['electrical', 'power', 'drives', 'renewable', 'high voltage', 'smart grid'])) {
    return ['Circuits, Machines and Fundamentals', 'Power Conversion and Control', 'Protection, Grid Operation and Applications']
  }
  if (includesAny(lower, ['signals', 'communication', 'vlsi', 'antenna', 'embedded', 'electromagnetic'])) {
    return ['Signal/System Fundamentals', 'Communication and Device Design', 'Implementation, Testing and Applications']
  }
  if (includesAny(lower, ['project work', 'elective'])) {
    return ['Problem Definition and Literature Review', 'Design, Implementation and Validation', 'Documentation, Viva and Deployment']
  }

  return [
    `${subjectName} Fundamentals`,
    `${subjectName} Analysis`,
    `${subjectName} Applications`,
  ]
}

function buildBtechModules(subjectName: string, chapterName: string): [string, string, string] {
  const lower = `${subjectName} ${chapterName}`.toLowerCase()

  if (includesAny(lower, ['project work'])) {
    return ['Problem Statement and Objectives', 'Implementation and Milestones', 'Results, Report and Presentation']
  }
  if (includesAny(lower, ['elective'])) {
    return ['Domain Fundamentals', 'Advanced Applications', 'Case Studies and Review']
  }
  if (includesAny(lower, ['cyber security', 'information security'])) {
    return ['Threats, Vulnerabilities and Cryptography', 'Security Protocols and Hardening', 'Incident Response and Case Analysis']
  }
  if (includesAny(lower, ['big data analytics', 'advanced data analytics', 'data analytics'])) {
    return ['Data Pipelines and Storage Models', 'Batch/Stream Processing', 'Analytics Case Studies and Evaluation']
  }
  if (includesAny(lower, ['artificial intelligence', 'machine learning'])) {
    return ['Model Fundamentals and Feature Engineering', 'Training, Validation and Optimization', 'Deployment and Error Analysis']
  }
  if (includesAny(lower, ['cloud', 'virtualization', 'distributed', 'devops'])) {
    return ['Cloud Architecture and Service Models', 'Containers, Orchestration and Scalability', 'Reliability, Monitoring and Cost Optimization']
  }
  if (includesAny(lower, ['wireless communication', 'optical communication', 'antenna', 'vlsi', 'embedded'])) {
    return ['Architecture and Signal Fundamentals', 'Design, Simulation and Constraints', 'Implementation, Testing and Performance']
  }
  if (includesAny(lower, ['smart grid', 'renewable', 'high voltage', 'electrical drives', 'switchgear', 'protection'])) {
    return ['System Components and Principles', 'Control, Protection and Stability', 'Grid/Plant Case Studies']
  }
  if (includesAny(lower, ['machinery diagnostics', 'mechanical systems', 'operations research'])) {
    return ['Modeling and Condition Monitoring', 'Optimization and Decision Methods', 'Industrial Problem Solving']
  }
  if (includesAny(lower, ['construction engineering', 'construction management', 'transportation', 'advanced structural'])) {
    return ['Planning, Design Codes and Methods', 'Execution, Quality and Risk Control', 'Project Cases and Field Evaluation']
  }
  if (includesAny(lower, [
    'programming',
    'algorithm',
    'data structures',
    'database',
    'operating systems',
    'computer networks',
    'network theory',
    'network analysis',
  ])) {
    return ['Core Concepts and Terminology', 'Design, Analysis and Implementation', 'Labs, Debugging and Case Problems']
  }
  if (includesAny(lower, ['mechanics', 'thermodynamics', 'fluid', 'heat', 'electrical', 'power', 'signals', 'communication', 'structural', 'geotechnical'])) {
    return ['Fundamental Laws and Models', 'Numerical Methods and Design', 'Industrial Applications and Case Studies']
  }

  const token = chapterToken(chapterName) || chapterToken(subjectName) || 'Topic'
  return [
    `${token} Fundamentals`,
    `${token} Problem Solving`,
    `${token} Engineering Applications`,
  ]
}

function buildSchoolProfile(std: number): LearnerProfile {
  const preferredSubjects = Object.keys(SCHOOL_SYLLABUS[std] ?? {})
  return {
    id: `sch.std${std}.core`,
    label: `Std ${std} - Core`,
    trackType: 'school',
    classLevel: std,
    preferredSubjects: preferredSubjects.length ? preferredSubjects : [...SCHOOL_SUBJECTS],
  }
}

function buildBtechProfile(branch: (typeof BTECH_BRANCHES)[number], semester: number): LearnerProfile {
  return {
    id: `bt.${branch.toLowerCase()}.sem${semester}`,
    label: `BTech ${branch} - Semester ${semester}`,
    trackType: 'btech',
    branch,
    semester,
    preferredSubjects: [...BTECH_CORE_SUBJECTS],
  }
}

const schoolProfiles: LearnerProfile[] = Array.from({ length: 8 }, (_, index) => buildSchoolProfile(index + 5))
const btechProfiles: LearnerProfile[] = BTECH_BRANCHES.flatMap((branch) =>
  Array.from({ length: 8 }, (_, index) => buildBtechProfile(branch, index + 1)),
)

export const learnerProfiles: LearnerProfile[] = [...schoolProfiles, ...btechProfiles]

const SCHOOL_STD9_PROFILE_ID = 'sch.std9.core'
const SCHOOL_STD10_PROFILE_ID = 'sch.std10.core'
const BTECH_CSE_SEM1_PROFILE_ID = 'bt.cse.sem1'
export const defaultProfileId = SCHOOL_STD9_PROFILE_ID

function buildSchoolSeed(profile: LearnerProfile): ProgramCatalogEntry {
  const stdId = `std${profile.classLevel}`
  const syllabus = profile.classLevel ? SCHOOL_SYLLABUS[profile.classLevel] : undefined
  const subjectNames = syllabus ? Object.keys(syllabus) : [...SCHOOL_SUBJECTS]

  const subjects: Subject[] = subjectNames.map((name) => ({
    id: `sub.sch.${stdId}.${slugify(name)}`,
    name,
    profileId: profile.id,
  }))
  const chapters: Chapter[] = subjects.flatMap((subject) => {
    const chapterList = syllabus?.[subject.name] ?? [...SCHOOL_DEFAULT_CHAPTERS]
    return chapterList.map((chapterName, chapterIndex) => ({
      id: `ch.${subject.id}.${chapterIndex + 1}`,
      name: chapterName,
      subjectId: subject.id,
    }))
  })
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject.name]))
  const modules: Module[] = chapters.flatMap((chapter) => {
    const subjectName = subjectById.get(chapter.subjectId) || 'General'
    return buildSchoolModules(subjectName, chapter.name).map((moduleName, moduleIndex) => ({
      id: `mod.${chapter.id}.${moduleIndex + 1}`,
      name: moduleName,
      chapterId: chapter.id,
    }))
  })
  const generated = buildGeneratedLearningArtifacts(subjects, chapters, modules)

  return {
    profile,
    subjects,
    chapters,
    modules,
    concepts: generated.concepts,
    conceptDependencies: generated.conceptDependencies,
    questions: generated.questions,
    quizzes: generated.quizzes,
  }
}

function buildBtechSeed(profile: LearnerProfile): ProgramCatalogEntry {
  const branchSlug = profile.branch?.toLowerCase() || 'general'
  const sem = profile.semester || 1
  const subjectList = profile.branch ? BTECH_SYLLABUS[profile.branch]?.[sem] ?? [...BTECH_CORE_SUBJECTS] : [...BTECH_CORE_SUBJECTS]
  const subjects: Subject[] = subjectList.map((name) => ({
    id: `sub.bt.${branchSlug}.sem${sem}.${slugify(name)}`,
    name,
    profileId: profile.id,
  }))

  const chapters: Chapter[] = subjects.flatMap((subject) =>
    buildBtechChapters(subject.name).map((chapterName, chapterIndex) => ({
      id: `ch.${subject.id}.${chapterIndex + 1}`,
      name: chapterName,
      subjectId: subject.id,
    })),
  )

  const subjectById = new Map(subjects.map((subject) => [subject.id, subject.name]))
  const chapterSubjectName = new Map(chapters.map((chapter) => [chapter.id, subjectById.get(chapter.subjectId) || 'General']))
  const modules: Module[] = chapters.flatMap((chapter) =>
    buildBtechModules(chapterSubjectName.get(chapter.id) || 'General', chapter.name).map((moduleName, moduleIndex) => ({
      id: `mod.${chapter.id}.${moduleIndex + 1}`,
      name: moduleName,
      chapterId: chapter.id,
    })),
  )
  const generated = buildGeneratedLearningArtifacts(subjects, chapters, modules)

  return {
    profile,
    subjects,
    chapters,
    modules,
    concepts: generated.concepts,
    conceptDependencies: generated.conceptDependencies,
    questions: generated.questions,
    quizzes: generated.quizzes,
  }
}

function buildProgramSeed(profile: LearnerProfile): ProgramCatalogEntry {
  return profile.trackType === 'school' ? buildSchoolSeed(profile) : buildBtechSeed(profile)
}

function moduleConceptNames(subjectName: string, chapterName: string, moduleName: string): [string, string] {
  const lower = `${subjectName} ${chapterName} ${moduleName}`.toLowerCase()
  if (lower.includes('pattern')) return ['Pattern Identification', 'Rule Formation and Extension']
  if (lower.includes('lines and angles') || lower.includes('angle')) return ['Angle Classification', 'Angle Measurement and Construction']
  if (lower.includes('prime') || lower.includes('hcf') || lower.includes('lcm')) return ['Divisibility and Prime Concepts', 'HCF/LCM Problem Solving']
  if (lower.includes('fraction')) return ['Fraction Representation', 'Fraction Operations']
  if (lower.includes('integer')) return ['Integers and Number Line', 'Integer Operations in Context']
  if (lower.includes('ratio') || lower.includes('proportion')) return ['Ratio Interpretation', 'Proportion-Based Reasoning']
  if (lower.includes('pictograph') || lower.includes('bar graph') || lower.includes('data')) return ['Data Representation', 'Data Interpretation']
  if (lower.includes('nutrient') || lower.includes('food')) return ['Nutrient Types and Sources', 'Balanced Diet Decisions']
  if (lower.includes('separation') || lower.includes('material')) return ['Material Properties', 'Separation Techniques']
  if (lower.includes('motion') || lower.includes('measurement')) return ['Distance, Time and Motion Types', 'Measurement Accuracy']
  if (lower.includes('light') || lower.includes('reflection') || lower.includes('shadow')) return ['Light Behavior', 'Shadows and Reflection Applications']
  if (lower.includes('electric') || lower.includes('circuit')) return ['Circuit Components and Flow', 'Conductors, Insulators and Safety']
  if (lower.includes('water') || lower.includes('air')) return ['Composition and Cycle', 'Conservation Practices']
  if (lower.includes('set')) return ['Set Notation and Membership', 'Set Operations and Venn Reasoning']
  if (lower.includes('relation') || lower.includes('function')) return ['Relation-Function Mapping', 'Domain, Range and Function Behavior']
  if (lower.includes('complex')) return ['Complex Form and Operations', 'Argand Representation and Modulus']
  if (lower.includes('permutation') || lower.includes('combination')) return ['Counting Strategies', 'Arrangement and Selection Logic']
  if (lower.includes('conic')) return ['Conic Equations and Parameters', 'Geometric Interpretation and Applications']
  if (lower.includes('limit') || lower.includes('continuity') || lower.includes('derivative')) return ['Limit and Continuity Concepts', 'Differentiation and Applications']
  if (lower.includes('matrix') || lower.includes('determinant')) return ['Matrix/Determinant Properties', 'Equation Solving via Matrices']
  if (lower.includes('integral')) return ['Integration Concepts', 'Area and Application Problems']
  if (lower.includes('differential equation')) return ['Formation and Solution Methods', 'Applied Differential Models']
  if (lower.includes('vector') || lower.includes('3d')) return ['Vector Operations and Geometry', 'Lines, Planes and Spatial Reasoning']
  if (lower.includes('linear programming')) return ['Constraints and Feasible Region', 'Objective Optimization']
  if (lower.includes('kinematics') || lower.includes('motion')) return ['Displacement, Velocity and Acceleration', 'Motion Graph Analysis']
  if (lower.includes('electro') || lower.includes('magnet')) return ['Electric/Magnetic Field Concepts', 'Circuit and Induction Applications']
  if (lower.includes('bonding') || lower.includes('equilibrium') || lower.includes('kinetics')) return ['Molecular Interaction Concepts', 'Rate/Equilibrium Analysis']
  if (lower.includes('inheritance') || lower.includes('biotechnology') || lower.includes('evolution')) return ['Core Biological Mechanisms', 'Application and Interpretation']

  if (lower.includes('rational')) return ['Equivalent Forms and Number Line', 'Operations and Word Problems']
  if (lower.includes('equation')) return ['Variable Isolation Steps', 'Equation Modelling from Statements']
  if (lower.includes('triangle')) return ['Angle-Side Relationships', 'Construction and Reasoning']
  if (lower.includes('government') || lower.includes('democracy') || lower.includes('constitution')) return ['Institutions and Roles', 'Civic Decisions and Impact']
  if (lower.includes('history') || lower.includes('mughal') || lower.includes('sultans') || lower.includes('revolution')) return ['Chronology and Causes', 'Consequences and Historical Evidence']
  if (lower.includes('reading') || lower.includes('literary') || lower.includes('vocabulary')) return ['Theme and Character Understanding', 'Language, Tone and Expression']
  if (lower.includes('algebra')) return ['Variables and Expressions', 'Equation Solving']
  if (lower.includes('geometry')) return ['Shape Properties', 'Geometric Construction']
  if (lower.includes('trigonometry')) return ['Trigonometric Ratios', 'Applications of Trigonometry']
  if (lower.includes('probability')) return ['Random Experiments', 'Probability Models']
  if (lower.includes('thermodynamics')) return ['System and Surroundings', 'Laws of Thermodynamics']
  if (lower.includes('programming')) return ['Algorithmic Thinking', 'Code Implementation']
  if (lower.includes('data structures')) return ['Linear Data Structures', 'Non-Linear Data Structures']
  if (lower.includes('networks')) return ['Protocol Layers', 'Routing and Addressing']
  if (lower.includes('digital')) return ['Logic Representation', 'Circuit Design']
  if (lower.includes('signals')) return ['Signal Representation', 'System Response']
  if (lower.includes('electric')) return ['Current, Voltage and Charge', 'Circuit Analysis and Safety']
  if (lower.includes('chemical')) return ['Chemical Species and Reactions', 'Stoichiometry and Application']
  if (lower.includes('cell') || lower.includes('biology')) return ['Cell Structure and Function', 'Process and Regulation']
  if (lower.includes('project')) return ['Problem Framing and Planning', 'Execution and Validation']
  return [`${moduleName} Foundation`, `${moduleName} Applications`]
}

function buildTopicAwareQuestion(
  subjectName: string,
  chapterName: string,
  moduleName: string,
  conceptName: string,
  questionIndex: number,
) {
  const lowerContext = `${subjectName} ${chapterName} ${moduleName} ${conceptName}`.toLowerCase()
  const seed = `${subjectName}|${chapterName}|${moduleName}|${conceptName}`
  const seedValue = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const pick = <T,>(values: T[], offset = 0) => values[(seedValue + offset) % values.length]
  const pickFromBank = <T,>(bank: T[]) => bank[(seedValue + questionIndex) % bank.length]

  if (lowerContext.includes('rational')) {
    const bank = [
      { questionText: 'Which number is rational?', options: ['7/9', 'sqrt(2)', 'pi', 'sqrt(3)'], correctAnswer: '7/9', explanation: 'A rational number can be written as p/q where q is non-zero.' },
      { questionText: 'Evaluate: (-3/4) + (1/2)', options: ['-1/4', '-5/4', '1/4', '-3/8'], correctAnswer: '-1/4', explanation: 'Use denominator 4: -3/4 + 2/4 = -1/4.' },
      { questionText: 'A container is 3/5 full and 1/5 is used. Fraction remaining is:', options: ['2/5', '3/10', '1/5', '1/2'], correctAnswer: '2/5', explanation: '3/5 - 1/5 = 2/5.' },
      { questionText: 'Which is equivalent to -4/6?', options: ['-2/3', '2/3', '-3/2', '4/6'], correctAnswer: '-2/3', explanation: 'Divide numerator and denominator by 2.' },
      { questionText: 'Arrange in ascending order: 1/2, 3/4, 2/3', options: ['1/2, 2/3, 3/4', '3/4, 2/3, 1/2', '2/3, 1/2, 3/4', '1/2, 3/4, 2/3'], correctAnswer: '1/2, 2/3, 3/4', explanation: 'Compare as decimals: 0.5, 0.67, 0.75.' },
      { questionText: 'What is 2/3 + 1/6?', options: ['5/6', '3/9', '1/2', '2/6'], correctAnswer: '5/6', explanation: '4/6 + 1/6 = 5/6.' },
      { questionText: 'Simplify: 15/25', options: ['3/5', '5/3', '1/2', '2/5'], correctAnswer: '3/5', explanation: 'Divide by 5: 15/25 = 3/5.' },
      { questionText: 'What is 3/4 × 2/5?', options: ['6/20', '5/9', '3/10', '1/2'], correctAnswer: '6/20', explanation: 'Multiply numerators and denominators: 6/20 = 3/10.' },
      { questionText: 'Which is greater: 5/8 or 3/5?', options: ['5/8', '3/5', 'Equal', 'Cannot compare'], correctAnswer: '5/8', explanation: '5/8 = 0.625, 3/5 = 0.6.' },
      { questionText: 'What is 7/8 - 3/8?', options: ['4/8', '10/8', '4/16', '1/2'], correctAnswer: '4/8', explanation: '7/8 - 3/8 = 4/8 = 1/2.' },
      { questionText: 'Convert 0.75 to a fraction:', options: ['3/4', '7/5', '75/10', '1/4'], correctAnswer: '3/4', explanation: '0.75 = 75/100 = 3/4.' },
      { questionText: 'What is 2/3 ÷ 4/5?', options: ['10/12', '8/15', '5/6', '2/15'], correctAnswer: '10/12', explanation: '2/3 × 5/4 = 10/12 = 5/6.' },
      { questionText: 'The reciprocal of 5/7 is:', options: ['7/5', '5/7', '-5/7', '1'], correctAnswer: '7/5', explanation: 'Flip numerator and denominator.' },
      { questionText: 'What is (-2/5) × (-3/4)?', options: ['6/20', '-6/20', '5/9', '-5/9'], correctAnswer: '6/20', explanation: 'Negative × negative = positive: 6/20 = 3/10.' },
      { questionText: 'Which is an irrational number?', options: ['√2', '22/7', '0.333...', '1.5'], correctAnswer: '√2', explanation: '√2 cannot be expressed as a fraction.' },
      { questionText: 'Express 2 3/4 as improper fraction:', options: ['11/4', '9/4', '8/4', '7/4'], correctAnswer: '11/4', explanation: '2 × 4 + 3 = 11, so 11/4.' },
      { questionText: 'What is 1/2 + 1/3 + 1/6?', options: ['1', '5/6', '2/3', '1/2'], correctAnswer: '1', explanation: '3/6 + 2/6 + 1/6 = 6/6 = 1.' },
      { questionText: 'Simplify: 24/36', options: ['2/3', '3/4', '4/6', '6/9'], correctAnswer: '2/3', explanation: 'GCD is 12: 24/36 = 2/3.' },
      { questionText: 'What is 5/6 - 1/3?', options: ['1/2', '4/6', '2/3', '1/6'], correctAnswer: '1/2', explanation: '5/6 - 2/6 = 3/6 = 1/2.' },
      { questionText: 'Convert 1.25 to a fraction:', options: ['5/4', '4/5', '125/10', '1/4'], correctAnswer: '5/4', explanation: '1.25 = 125/100 = 5/4.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('cyber security') || lowerContext.includes('information security') || lowerContext.includes('cryptography')) {
    const bank = [
      {
        questionText: 'Which attack tries many password combinations automatically?',
        options: ['Brute-force attack', 'Phishing only', 'SQL optimization', 'Load balancing'],
        correctAnswer: 'Brute-force attack',
        explanation: 'Brute-force attacks repeatedly try credential combinations.',
      },
      {
        questionText: 'A strong password policy should include:',
        options: ['Length + mixed character types', 'Only lowercase letters', 'Same password for all sites', 'Personal birth date'],
        correctAnswer: 'Length + mixed character types',
        explanation: 'Complexity and length reduce guessability.',
      },
      {
        questionText: 'HTTPS mainly protects data through:',
        options: ['Encryption using TLS', 'Higher internet speed', 'Larger packet size', 'No authentication'],
        correctAnswer: 'Encryption using TLS',
        explanation: 'TLS encrypts client-server communication.',
      },
      {
        questionText: 'Which is an example of social engineering?',
        options: ['Phishing email', 'Compiler optimization', 'CPU scheduling', 'Database indexing'],
        correctAnswer: 'Phishing email',
        explanation: 'Phishing manipulates users into revealing secrets.',
      },
      {
        questionText: 'Principle of least privilege means:',
        options: ['Give minimum required access', 'Give admin access to all', 'No access controls', 'Allow shared root account'],
        correctAnswer: 'Give minimum required access',
        explanation: 'Users/processes should get only permissions they need.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('cloud') || lowerContext.includes('virtualization') || lowerContext.includes('distributed')) {
    const bank = [
      {
        questionText: 'Which cloud model provides virtual machines and storage?',
        options: ['IaaS', 'SaaS only', 'PaaS only', 'On-prem only'],
        correctAnswer: 'IaaS',
        explanation: 'IaaS offers infrastructure resources like VMs and storage.',
      },
      {
        questionText: 'Container orchestration at scale is commonly done by:',
        options: ['Kubernetes', 'Photoshop', 'FTP', 'BIOS'],
        correctAnswer: 'Kubernetes',
        explanation: 'Kubernetes manages deployment/scaling of containers.',
      },
      {
        questionText: 'Auto-scaling in cloud helps primarily with:',
        options: ['Handling variable workload efficiently', 'Disabling monitoring', 'Removing backups', 'Eliminating networking'],
        correctAnswer: 'Handling variable workload efficiently',
        explanation: 'Auto-scaling adjusts resources based on demand.',
      },
      {
        questionText: 'In distributed systems, eventual consistency means:',
        options: ['Replicas converge over time', 'All replicas always instant', 'No replication', 'Data always stale'],
        correctAnswer: 'Replicas converge over time',
        explanation: 'State may differ briefly but eventually converges.',
      },
      {
        questionText: 'Main purpose of load balancer is to:',
        options: ['Distribute requests across servers', 'Encrypt files at rest only', 'Compile source code', 'Replace databases'],
        correctAnswer: 'Distribute requests across servers',
        explanation: 'Load balancers improve availability and throughput.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('artificial intelligence') || lowerContext.includes('machine learning') || lowerContext.includes('analytics')) {
    const bank = [
      {
        questionText: 'In supervised learning, model is trained using:',
        options: ['Labeled data', 'Only unlabeled data', 'No data', 'Random guesses only'],
        correctAnswer: 'Labeled data',
        explanation: 'Supervised learning learns mapping from labeled examples.',
      },
      {
        questionText: 'Overfitting means model:',
        options: ['Performs well on training but poorly on new data', 'Fails on all data equally', 'Needs fewer features always', 'Has no parameters'],
        correctAnswer: 'Performs well on training but poorly on new data',
        explanation: 'Overfit models memorize noise instead of generalizing.',
      },
      {
        questionText: 'Precision-recall tradeoff is important when classes are:',
        options: ['Imbalanced', 'Perfectly equal always', 'Absent', 'All numeric only'],
        correctAnswer: 'Imbalanced',
        explanation: 'Imbalanced datasets need careful precision/recall balance.',
      },
      {
        questionText: 'Feature scaling is often required for:',
        options: ['Distance-based algorithms', 'All tree models only', 'SQL joins', 'Packet routing'],
        correctAnswer: 'Distance-based algorithms',
        explanation: 'Distance metrics are sensitive to feature scale.',
      },
      {
        questionText: 'Cross-validation is used to:',
        options: ['Estimate generalization performance', 'Increase training labels', 'Replace test set entirely', 'Encrypt model weights'],
        correctAnswer: 'Estimate generalization performance',
        explanation: 'It evaluates model stability across splits.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('vlsi') || lowerContext.includes('embedded') || lowerContext.includes('wireless') || lowerContext.includes('optical') || lowerContext.includes('antenna')) {
    const bank = [
      {
        questionText: 'In CMOS design, dynamic power is roughly proportional to:',
        options: ['C*V^2*f', 'V/f', 'R/C', 'I*R^2'],
        correctAnswer: 'C*V^2*f',
        explanation: 'CMOS dynamic switching power follows C*V^2*f relation.',
      },
      {
        questionText: 'An embedded system is best described as:',
        options: ['Dedicated computing system for specific function', 'General-purpose desktop only', 'No hardware-software integration', 'Only analog circuit'],
        correctAnswer: 'Dedicated computing system for specific function',
        explanation: 'Embedded systems are application-specific computing units.',
      },
      {
        questionText: 'Main advantage of optical fiber communication is:',
        options: ['High bandwidth with low attenuation', 'High electromagnetic interference', 'Very short range only', 'No modulation needed'],
        correctAnswer: 'High bandwidth with low attenuation',
        explanation: 'Fiber supports high-speed long-distance links.',
      },
      {
        questionText: 'In wireless communication, multipath fading causes:',
        options: ['Signal amplitude fluctuations', 'Guaranteed zero noise', 'No interference ever', 'Constant unlimited bandwidth'],
        correctAnswer: 'Signal amplitude fluctuations',
        explanation: 'Multipath leads to constructive/destructive interference.',
      },
      {
        questionText: 'Antenna gain indicates:',
        options: ['Directional radiation effectiveness', 'Battery capacity', 'Cable resistance', 'Processor clock speed'],
        correctAnswer: 'Directional radiation effectiveness',
        explanation: 'Gain measures how well antenna concentrates energy.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('smart grid') || lowerContext.includes('renewable') || lowerContext.includes('high voltage') || lowerContext.includes('drives') || lowerContext.includes('protection')) {
    const bank = [
      {
        questionText: 'A relay in power systems is used for:',
        options: ['Fault detection and tripping', 'Data compression', 'Voltage generation', 'Mechanical lubrication'],
        correctAnswer: 'Fault detection and tripping',
        explanation: 'Relays detect abnormal conditions and initiate protection.',
      },
      {
        questionText: 'Power factor correction helps to:',
        options: ['Improve system efficiency and reduce losses', 'Increase harmonic distortion', 'Eliminate all transmission lines', 'Disable capacitors'],
        correctAnswer: 'Improve system efficiency and reduce losses',
        explanation: 'Better power factor lowers reactive current and losses.',
      },
      {
        questionText: 'A key feature of smart grids is:',
        options: ['Two-way communication and monitoring', 'No sensing at all', 'Manual-only operation', 'No renewable integration'],
        correctAnswer: 'Two-way communication and monitoring',
        explanation: 'Smart grids rely on sensing, communication and automation.',
      },
      {
        questionText: 'MPPT in solar systems is used to:',
        options: ['Track maximum power operating point', 'Increase panel temperature', 'Remove inverter', 'Disable charge controller'],
        correctAnswer: 'Track maximum power operating point',
        explanation: 'MPPT maximizes extracted PV power.',
      },
      {
        questionText: 'Insulation coordination in high-voltage engineering ensures:',
        options: ['Safe withstand levels for overvoltages', 'Higher software throughput', 'No grounding needed', 'Battery balancing'],
        correctAnswer: 'Safe withstand levels for overvoltages',
        explanation: 'It aligns insulation strength with expected surges.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('machinery diagnostics') || lowerContext.includes('mechanical systems') || lowerContext.includes('construction') || lowerContext.includes('transportation')) {
    const bank = [
      {
        questionText: 'Vibration analysis in machines is mainly used for:',
        options: ['Condition monitoring and fault diagnosis', 'Fuel refinement', 'Compiler testing', 'Network routing'],
        correctAnswer: 'Condition monitoring and fault diagnosis',
        explanation: 'Vibration signatures help identify mechanical faults.',
      },
      {
        questionText: 'Critical path in project scheduling is the path with:',
        options: ['Longest duration', 'Least cost always', 'Most resources only', 'No dependencies'],
        correctAnswer: 'Longest duration',
        explanation: 'Critical path determines project completion time.',
      },
      {
        questionText: 'In highway design, superelevation is provided to:',
        options: ['Counteract centrifugal force on curves', 'Increase lane width randomly', 'Reduce pavement thickness to zero', 'Eliminate drainage'],
        correctAnswer: 'Counteract centrifugal force on curves',
        explanation: 'Superelevation improves safety on horizontal curves.',
      },
      {
        questionText: 'Finite element method is commonly used to:',
        options: ['Approximate complex engineering systems', 'Encrypt databases', 'Manage DNS records', 'Render UI themes'],
        correctAnswer: 'Approximate complex engineering systems',
        explanation: 'FEM discretizes domains for numerical solutions.',
      },
      {
        questionText: 'Bearing fault frequencies are typically identified from:',
        options: ['Spectrum of vibration signals', 'Email logs', 'Compiler warnings', 'Weather charts'],
        correctAnswer: 'Spectrum of vibration signals',
        explanation: 'Frequency-domain analysis reveals defect signatures.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('project work') || lowerContext.includes('elective')) {
    const bank = [
      {
        questionText: 'A strong project problem statement should be:',
        options: ['Specific, measurable and scoped', 'Very vague and broad', 'Unrelated to objectives', 'Without constraints'],
        correctAnswer: 'Specific, measurable and scoped',
        explanation: 'Clear scope makes implementation and evaluation feasible.',
      },
      {
        questionText: 'Literature review in final-year project is used to:',
        options: ['Identify prior work and gaps', 'Skip implementation', 'Avoid citations', 'Replace experiments'],
        correctAnswer: 'Identify prior work and gaps',
        explanation: 'Review positions your work against existing methods.',
      },
      {
        questionText: 'A meaningful project evaluation metric should:',
        options: ['Align with objectives and use test data', 'Be chosen after results only', 'Ignore baseline', 'Avoid reproducibility'],
        correctAnswer: 'Align with objectives and use test data',
        explanation: 'Metrics must reflect intended performance goals.',
      },
      {
        questionText: 'Version control in project work helps with:',
        options: ['Traceability and collaboration', 'Eliminating documentation', 'Reducing testing to zero', 'Avoiding backups'],
        correctAnswer: 'Traceability and collaboration',
        explanation: 'Version history enables teamwork and safe iteration.',
      },
      {
        questionText: 'A good viva presentation should include:',
        options: ['Problem, method, results, limitations', 'Only title slide', 'No results section', 'No references'],
        correctAnswer: 'Problem, method, results, limitations',
        explanation: 'Complete narrative demonstrates depth and rigor.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('sets')) {
    const bank = [
      { questionText: 'If A = {1,2,3} and B = {3,4}, then A ∩ B is:', options: ['{3}', '{1,2,3,4}', '{1,2}', 'empty set'], correctAnswer: '{3}', explanation: 'Intersection contains common elements only.' },
      { questionText: 'Universal set in a problem denotes:', options: ['All elements under discussion', 'Only intersection', 'Only complement', 'Only empty set'], correctAnswer: 'All elements under discussion', explanation: 'Universal set is the complete reference set.' },
      { questionText: 'If n(A)=20, n(B)=15, n(A∩B)=5, then n(A∪B)=', options: ['30', '40', '10', '25'], correctAnswer: '30', explanation: 'n(A∪B)=n(A)+n(B)-n(A∩B)=20+15-5.' },
      { questionText: 'Subset relation is written as:', options: ['⊆', '∪', '∩', '∈'], correctAnswer: '⊆', explanation: 'A ⊆ B means every element of A is in B.' },
      { questionText: 'Complement of set A contains elements:', options: ['Not in A but in universal set', 'Only in A', 'Only in A∩B', 'Only in empty set'], correctAnswer: 'Not in A but in universal set', explanation: 'A complement includes all elements outside A.' },
      { questionText: 'A ∪ B means:', options: ['All elements in A or B or both', 'Only common elements', 'Elements in A only', 'Empty set'], correctAnswer: 'All elements in A or B or both', explanation: 'Union combines all elements from both sets.' },
      { questionText: 'If A = {1,2,3,4} and B = {2,4,6}, then A - B is:', options: ['{1,3}', '{2,4}', '{6}', '{1,2,3,4,6}'], correctAnswer: '{1,3}', explanation: 'A - B contains elements in A but not in B.' },
      { questionText: 'The empty set is denoted by:', options: ['∅ or {}', '∞', 'U', 'N'], correctAnswer: '∅ or {}', explanation: 'Empty set has no elements.' },
      { questionText: 'If A ⊂ B, then A ∩ B equals:', options: ['A', 'B', 'A ∪ B', '∅'], correctAnswer: 'A', explanation: 'If A is a subset of B, intersection is A.' },
      { questionText: 'n(A ∪ B) is maximum when:', options: ['A ∩ B = ∅', 'A = B', 'A ⊂ B', 'B ⊂ A'], correctAnswer: 'A ∩ B = ∅', explanation: 'No overlap means maximum union size.' },
      { questionText: 'If U = {1,2,3,4,5} and A = {1,3,5}, then A\' is:', options: ['{2,4}', '{1,3,5}', '{1,2,3,4,5}', '∅'], correctAnswer: '{2,4}', explanation: 'Complement contains elements not in A.' },
      { questionText: 'The power set of {a,b} has how many elements?', options: ['4', '2', '3', '8'], correctAnswer: '4', explanation: 'Power set has 2^n elements: {}, {a}, {b}, {a,b}.' },
      { questionText: 'A ∩ A\' equals:', options: ['∅', 'A', 'U', 'A\''], correctAnswer: '∅', explanation: 'A set and its complement have no common elements.' },
      { questionText: 'A ∪ A\' equals:', options: ['U', 'A', '∅', 'A\''], correctAnswer: 'U', explanation: 'A set and its complement together form universal set.' },
      { questionText: 'If A = {x : x is even, x < 10}, then A =', options: ['{2,4,6,8}', '{1,3,5,7,9}', '{0,2,4,6,8}', '{2,4,6,8,10}'], correctAnswer: '{2,4,6,8}', explanation: 'Even numbers less than 10: 2,4,6,8.' },
      { questionText: 'Two sets are equal if:', options: ['They have same elements', 'They have same number of elements', 'They are both empty', 'One is subset of other'], correctAnswer: 'They have same elements', explanation: 'Equal sets have identical elements.' },
      { questionText: 'De Morgan\'s law states (A ∪ B)\' =', options: ['A\' ∩ B\'', 'A\' ∪ B\'', 'A ∩ B', 'A ∪ B'], correctAnswer: 'A\' ∩ B\'', explanation: 'Complement of union is intersection of complements.' },
      { questionText: 'If A has 3 elements and B has 2 elements, max n(A ∩ B) is:', options: ['2', '3', '5', '1'], correctAnswer: '2', explanation: 'Cannot exceed smaller set size.' },
      { questionText: 'The set {1,1,2,2,3} in roster form is:', options: ['{1,2,3}', '{1,1,2,2,3}', '{6}', '∅'], correctAnswer: '{1,2,3}', explanation: 'Sets contain unique elements only.' },
      { questionText: 'If A ∩ B = A, then:', options: ['A ⊆ B', 'B ⊆ A', 'A = ∅', 'B = ∅'], correctAnswer: 'A ⊆ B', explanation: 'If intersection equals A, A is subset of B.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('relations and functions') || lowerContext.includes('relation') || lowerContext.includes('function')) {
    const bank = [
      { questionText: 'A function from A to B assigns:', options: ['Each element of A exactly one image in B', 'Each element of B one image in A', 'Many domains to one set only', 'No mapping needed'], correctAnswer: 'Each element of A exactly one image in B', explanation: 'Function requires unique image for each domain element.' },
      { questionText: 'Domain of f(x)=1/(x-2) is:', options: ['All real x except 2', 'All real x', 'x > 2 only', 'x < 2 only'], correctAnswer: 'All real x except 2', explanation: 'Denominator cannot be zero.' },
      { questionText: 'If f(x)=2x+1, then f(3)=', options: ['7', '6', '5', '8'], correctAnswer: '7', explanation: 'Substitute x=3: 2(3)+1=7.' },
      { questionText: 'A one-one function means:', options: ['Distinct inputs have distinct outputs', 'All outputs same', 'Not defined for all inputs', 'Many-one only'], correctAnswer: 'Distinct inputs have distinct outputs', explanation: 'Injective function maps unique outputs.' },
      { questionText: 'Range of f(x)=x² for real x is:', options: ['y ≥ 0', 'All real numbers', 'y ≤ 0', 'Only integers'], correctAnswer: 'y ≥ 0', explanation: 'Square of real number is non-negative.' },
      { questionText: 'If f(x)=x+3 and g(x)=2x, then (fog)(2)=', options: ['7', '10', '8', '6'], correctAnswer: '7', explanation: 'g(2)=4, then f(4)=7.' },
      { questionText: 'An onto function means:', options: ['Every element in codomain has a preimage', 'No element has preimage', 'Only some have preimage', 'Domain equals codomain'], correctAnswer: 'Every element in codomain has a preimage', explanation: 'Surjective function covers entire codomain.' },
      { questionText: 'Domain of f(x)=√(x-3) is:', options: ['x ≥ 3', 'x > 3', 'x ≤ 3', 'All real x'], correctAnswer: 'x ≥ 3', explanation: 'Expression under root must be non-negative.' },
      { questionText: 'If f(x)=3x-2, find f⁻¹(x):', options: ['(x+2)/3', '(x-2)/3', '3x+2', '2-3x'], correctAnswer: '(x+2)/3', explanation: 'Solve y=3x-2 for x: x=(y+2)/3.' },
      { questionText: 'A relation R on set A is reflexive if:', options: ['(a,a) ∈ R for all a ∈ A', '(a,b) ∈ R implies (b,a) ∈ R', '(a,b),(b,c) ∈ R implies (a,c) ∈ R', 'R is empty'], correctAnswer: '(a,a) ∈ R for all a ∈ A', explanation: 'Every element relates to itself.' },
      { questionText: 'If f(x)=|x|, then f(-5)=', options: ['5', '-5', '0', '25'], correctAnswer: '5', explanation: 'Absolute value of -5 is 5.' },
      { questionText: 'The identity function is:', options: ['f(x)=x', 'f(x)=0', 'f(x)=1', 'f(x)=x²'], correctAnswer: 'f(x)=x', explanation: 'Identity function returns input unchanged.' },
      { questionText: 'A symmetric relation satisfies:', options: ['(a,b) ∈ R implies (b,a) ∈ R', '(a,a) ∈ R', '(a,b),(b,c) implies (a,c)', 'R is empty'], correctAnswer: '(a,b) ∈ R implies (b,a) ∈ R', explanation: 'If a relates to b, b relates to a.' },
      { questionText: 'If f(x)=x² and g(x)=x+1, then (gof)(3)=', options: ['10', '16', '12', '9'], correctAnswer: '10', explanation: 'f(3)=9, then g(9)=10.' },
      { questionText: 'A transitive relation satisfies:', options: ['(a,b),(b,c) ∈ R implies (a,c) ∈ R', '(a,a) ∈ R', '(a,b) implies (b,a)', 'R has one element'], correctAnswer: '(a,b),(b,c) ∈ R implies (a,c) ∈ R', explanation: 'Transitivity chains relations.' },
      { questionText: 'The constant function f(x)=5 has range:', options: ['{5}', 'All real numbers', '∅', '{0,5}'], correctAnswer: '{5}', explanation: 'Output is always 5.' },
      { questionText: 'An equivalence relation is:', options: ['Reflexive, symmetric, and transitive', 'Only reflexive', 'Only symmetric', 'Only transitive'], correctAnswer: 'Reflexive, symmetric, and transitive', explanation: 'All three properties required.' },
      { questionText: 'If f(x)=2x and g(x)=x/2, then (fog)(x)=', options: ['x', '4x', 'x/4', 'x²'], correctAnswer: 'x', explanation: 'g(x)=x/2, f(x/2)=2(x/2)=x.' },
      { questionText: 'Domain of f(x)=log(x) is:', options: ['x > 0', 'x ≥ 0', 'All real x', 'x < 0'], correctAnswer: 'x > 0', explanation: 'Logarithm defined only for positive numbers.' },
      { questionText: 'A bijective function is:', options: ['Both one-one and onto', 'Only one-one', 'Only onto', 'Neither'], correctAnswer: 'Both one-one and onto', explanation: 'Bijection is injective and surjective.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('complex')) {
    const bank = [
      { questionText: 'i² equals:', options: ['-1', '1', '0', 'i'], correctAnswer: '-1', explanation: 'Imaginary unit property: i²=-1.' },
      { questionText: 'Modulus of 3+4i is:', options: ['5', '7', '1', '25'], correctAnswer: '5', explanation: 'sqrt(3²+4²)=sqrt(25)=5.' },
      { questionText: '(2+i) + (1-3i) equals:', options: ['3-2i', '3+2i', '1-4i', '2-3i'], correctAnswer: '3-2i', explanation: 'Add real and imaginary parts separately.' },
      { questionText: 'Conjugate of a+bi is:', options: ['a-bi', '-a+bi', 'a+bi', '-a-bi'], correctAnswer: 'a-bi', explanation: 'Conjugate changes sign of imaginary part.' },
      { questionText: 'i³ equals:', options: ['-i', 'i', '1', '-1'], correctAnswer: '-i', explanation: 'i³=i²·i=(-1)·i=-i.' },
      { questionText: '(3+2i)(1-i) equals:', options: ['5-i', '5+i', '3-2i', '1+5i'], correctAnswer: '5-i', explanation: '3-3i+2i-2i²=3-i+2=5-i.' },
      { questionText: 'The real part of 7-4i is:', options: ['7', '-4', '4', '-7'], correctAnswer: '7', explanation: 'Real part is the non-i coefficient.' },
      { questionText: 'i⁴ equals:', options: ['1', '-1', 'i', '-i'], correctAnswer: '1', explanation: 'i⁴=(i²)²=(-1)²=1.' },
      { questionText: 'If z=2+3i, then z·z̄ equals:', options: ['13', '5', '-5', '4+9i'], correctAnswer: '13', explanation: 'z·z̄=|z|²=4+9=13.' },
      { questionText: 'The imaginary part of 5+6i is:', options: ['6', '5', '6i', '5i'], correctAnswer: '6', explanation: 'Imaginary part is coefficient of i.' },
      { questionText: '1/i equals:', options: ['-i', 'i', '1', '-1'], correctAnswer: '-i', explanation: '1/i = i/i² = i/(-1) = -i.' },
      { questionText: 'Argument of 1+i is:', options: ['π/4', 'π/2', 'π', '0'], correctAnswer: 'π/4', explanation: 'tan⁻¹(1/1)=π/4 in first quadrant.' },
      { questionText: '(1+i)² equals:', options: ['2i', '2', '0', '1+2i'], correctAnswer: '2i', explanation: '1+2i+i²=1+2i-1=2i.' },
      { questionText: 'Modulus of -3-4i is:', options: ['5', '-5', '7', '1'], correctAnswer: '5', explanation: 'sqrt(9+16)=5, modulus is always positive.' },
      { questionText: '|z₁·z₂| equals:', options: ['|z₁|·|z₂|', '|z₁|+|z₂|', '|z₁|-|z₂|', '|z₁|/|z₂|'], correctAnswer: '|z₁|·|z₂|', explanation: 'Modulus of product equals product of moduli.' },
      { questionText: 'The conjugate of 5i is:', options: ['-5i', '5i', '5', '-5'], correctAnswer: '-5i', explanation: 'Conjugate of 0+5i is 0-5i=-5i.' },
      { questionText: 'If z=1-i, then |z| is:', options: ['√2', '2', '0', '1'], correctAnswer: '√2', explanation: 'sqrt(1+1)=√2.' },
      { questionText: '(a+bi)(a-bi) equals:', options: ['a²+b²', 'a²-b²', '2ab', '2abi'], correctAnswer: 'a²+b²', explanation: 'Product of conjugates gives sum of squares.' },
      { questionText: 'i¹⁰⁰ equals:', options: ['1', '-1', 'i', '-i'], correctAnswer: '1', explanation: '100÷4=25 remainder 0, so i¹⁰⁰=(i⁴)²⁵=1.' },
      { questionText: 'The polar form of 1+i is:', options: ['√2(cos π/4 + i sin π/4)', '2(cos π/4 + i sin π/4)', 'cos π/4 + i sin π/4', '√2(cos π/2 + i sin π/2)'], correctAnswer: '√2(cos π/4 + i sin π/4)', explanation: 'r=√2, θ=π/4.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('matrix') || lowerContext.includes('determinant')) {
    const bank = [
      {
        questionText: 'Determinant of [[a,b],[c,d]] is:',
        options: ['ad-bc', 'ab-cd', 'ac-bd', 'a+b+c+d'],
        correctAnswer: 'ad-bc',
        explanation: 'Standard 2x2 determinant formula.',
      },
      {
        questionText: 'Identity matrix has:',
        options: ['1 on diagonal and 0 elsewhere', 'All ones', 'All zeros', 'Random entries'],
        correctAnswer: '1 on diagonal and 0 elsewhere',
        explanation: 'Identity leaves vector unchanged on multiplication.',
      },
      {
        questionText: 'A square matrix has:',
        options: ['Equal rows and columns', 'Only 2 rows', 'Only 2 columns', 'No determinant'],
        correctAnswer: 'Equal rows and columns',
        explanation: 'By definition, order n x n.',
      },
      {
        questionText: 'If determinant is zero, matrix is:',
        options: ['Singular', 'Identity', 'Orthogonal', 'Diagonal only'],
        correctAnswer: 'Singular',
        explanation: 'Singular matrix is non-invertible.',
      },
      {
        questionText: 'Cramer rule is used to solve:',
        options: ['Linear equations', 'Quadratic inequalities', 'Trigonometric identities', 'Probability trees'],
        correctAnswer: 'Linear equations',
        explanation: 'It uses determinants to solve linear systems.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('integral')) {
    const bank = [
      {
        questionText: 'Integral of x dx is:',
        options: ['x^2/2 + C', 'x + C', '2x + C', '1/x + C'],
        correctAnswer: 'x^2/2 + C',
        explanation: 'Use power rule for integration.',
      },
      {
        questionText: 'Definite integral gives:',
        options: ['Net area under curve', 'Only slope', 'Only intercept', 'Only maximum point'],
        correctAnswer: 'Net area under curve',
        explanation: 'Definite integral accumulates signed area.',
      },
      {
        questionText: 'd/dx (sin x) is:',
        options: ['cos x', '-sin x', 'tan x', 'sec x'],
        correctAnswer: 'cos x',
        explanation: 'Basic derivative identity.',
      },
      {
        questionText: 'Integral of 1/x dx is:',
        options: ['ln|x| + C', 'x + C', '1/x^2 + C', 'e^x + C'],
        correctAnswer: 'ln|x| + C',
        explanation: 'Standard integral form.',
      },
      {
        questionText: 'Area under y=1 from x=0 to x=3 is:',
        options: ['3', '1', '0', '9'],
        correctAnswer: '3',
        explanation: 'Rectangle area = base*height = 3*1.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('vector') || lowerContext.includes('three dimensional geometry') || lowerContext.includes('3d')) {
    const bank = [
      {
        questionText: 'Magnitude of vector (3,4,0) is:',
        options: ['5', '7', '4', '3'],
        correctAnswer: '5',
        explanation: 'sqrt(3^2+4^2+0^2)=5.',
      },
      {
        questionText: 'Dot product of perpendicular vectors is:',
        options: ['0', '1', '-1', 'Undefined'],
        correctAnswer: '0',
        explanation: 'cos 90° = 0, so dot product is zero.',
      },
      {
        questionText: 'Direction ratios of x-axis are:',
        options: ['1,0,0', '0,1,0', '0,0,1', '1,1,1'],
        correctAnswer: '1,0,0',
        explanation: 'x-axis points only in x-direction.',
      },
      {
        questionText: 'Equation of plane has general form:',
        options: ['ax+by+cz+d=0', 'ax^2+by^2=0', 'x+y=1', 'x^2+y^2+z^2=0'],
        correctAnswer: 'ax+by+cz+d=0',
        explanation: 'General first-degree plane equation.',
      },
      {
        questionText: 'Unit vector has magnitude:',
        options: ['1', '0', '-1', '2'],
        correctAnswer: '1',
        explanation: 'By definition unit vector length is 1.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('pattern')) {
    const bank = [
      {
        questionText: 'Find the next number in the pattern: 2, 5, 8, 11, __',
        options: ['14', '13', '15', '16'],
        correctAnswer: '14',
        explanation: 'The pattern increases by 3 each time.',
      },
      {
        questionText: 'Which rule fits the sequence 4, 8, 12, 16?',
        options: ['Add 4 each step', 'Multiply by 2 each step', 'Add 3 each step', 'Subtract 2 each step'],
        correctAnswer: 'Add 4 each step',
        explanation: 'Each consecutive term differs by +4.',
      },
      {
        questionText: 'In shape patterns, repeating unit means:',
        options: ['A block that repeats in same order', 'Any random shape', 'Only one shape once', 'No rule required'],
        correctAnswer: 'A block that repeats in same order',
        explanation: 'Pattern unit is the smallest repeatable block.',
      },
      {
        questionText: 'If nth term is 3n + 1, the 4th term is:',
        options: ['13', '12', '10', '15'],
        correctAnswer: '13',
        explanation: '3(4) + 1 = 13.',
      },
      {
        questionText: 'Which of these is NOT a pattern?',
        options: ['2, 4, 7, 11', '5, 10, 15, 20', '1, 3, 5, 7', '10, 8, 6, 4'],
        correctAnswer: '2, 4, 7, 11',
        explanation: 'Differences are 2,3,4 so not a constant simple pattern unlike others.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('lines') || lowerContext.includes('angle')) {
    const bank = [
      {
        questionText: 'An angle of 90° is called:',
        options: ['Right angle', 'Acute angle', 'Obtuse angle', 'Straight angle'],
        correctAnswer: 'Right angle',
        explanation: 'Right angle measures exactly 90°.',
      },
      {
        questionText: 'Angles less than 90° are:',
        options: ['Acute', 'Obtuse', 'Reflex', 'Straight'],
        correctAnswer: 'Acute',
        explanation: 'Acute angles are < 90°.',
      },
      {
        questionText: 'A straight angle measures:',
        options: ['180°', '90°', '360°', '45°'],
        correctAnswer: '180°',
        explanation: 'A straight line forms 180° angle.',
      },
      {
        questionText: 'Vertically opposite angles are:',
        options: ['Equal', 'Supplementary only', 'Always 90°', 'Always different'],
        correctAnswer: 'Equal',
        explanation: 'Vertical opposite angles are always equal.',
      },
      {
        questionText: 'Which tool is best to measure angles?',
        options: ['Protractor', 'Ruler', 'Compass only', 'Divider'],
        correctAnswer: 'Protractor',
        explanation: 'Protractor measures angle in degrees.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('fraction')) {
    const bank = [
      { questionText: 'Simplify: 12/18', options: ['2/3', '3/4', '4/6', '6/9'], correctAnswer: '2/3', explanation: 'GCD of 12 and 18 is 6: 12/18 = 2/3.' },
      { questionText: 'What is 1/4 + 1/2?', options: ['3/4', '2/6', '1/6', '2/4'], correctAnswer: '3/4', explanation: '1/4 + 2/4 = 3/4.' },
      { questionText: 'Convert 0.25 to a fraction:', options: ['1/4', '1/2', '2/5', '1/5'], correctAnswer: '1/4', explanation: '0.25 = 25/100 = 1/4.' },
      { questionText: 'What is 3/5 - 1/5?', options: ['2/5', '4/5', '2/10', '1/5'], correctAnswer: '2/5', explanation: 'Same denominator: 3/5 - 1/5 = 2/5.' },
      { questionText: '2/3 × 3/4 equals:', options: ['1/2', '6/7', '5/7', '2/4'], correctAnswer: '1/2', explanation: '(2×3)/(3×4) = 6/12 = 1/2.' },
      { questionText: 'Which is greater: 2/3 or 3/5?', options: ['2/3', '3/5', 'Equal', 'Cannot compare'], correctAnswer: '2/3', explanation: '2/3 ≈ 0.667, 3/5 = 0.6.' },
      { questionText: '5/6 ÷ 2/3 equals:', options: ['5/4', '10/18', '3/4', '2/3'], correctAnswer: '5/4', explanation: '5/6 × 3/2 = 15/12 = 5/4.' },
      { questionText: 'Express 2 1/3 as improper fraction:', options: ['7/3', '5/3', '8/3', '6/3'], correctAnswer: '7/3', explanation: '2×3 + 1 = 7, so 7/3.' },
      { questionText: 'What is 4/7 + 2/7?', options: ['6/7', '6/14', '2/7', '8/7'], correctAnswer: '6/7', explanation: 'Same denominator: add numerators.' },
      { questionText: 'Simplify: 24/32', options: ['3/4', '2/3', '4/5', '6/8'], correctAnswer: '3/4', explanation: 'GCD is 8: 24/32 = 3/4.' },
      { questionText: 'What is 1/3 of 12?', options: ['4', '3', '6', '36'], correctAnswer: '4', explanation: '12 × 1/3 = 12/3 = 4.' },
      { questionText: '7/8 - 3/8 equals:', options: ['1/2', '4/8', '4/16', '10/8'], correctAnswer: '1/2', explanation: '4/8 = 1/2.' },
      { questionText: 'The reciprocal of 3/7 is:', options: ['7/3', '3/7', '-3/7', '1'], correctAnswer: '7/3', explanation: 'Flip numerator and denominator.' },
      { questionText: 'What is 2/5 + 3/10?', options: ['7/10', '5/15', '1/2', '5/10'], correctAnswer: '7/10', explanation: '4/10 + 3/10 = 7/10.' },
      { questionText: 'Convert 7/4 to mixed number:', options: ['1 3/4', '2 1/4', '1 1/2', '3/4'], correctAnswer: '1 3/4', explanation: '7÷4 = 1 remainder 3.' },
      { questionText: '3/4 × 8 equals:', options: ['6', '24', '11', '32'], correctAnswer: '6', explanation: '3/4 × 8 = 24/4 = 6.' },
      { questionText: 'Which fraction is in lowest terms?', options: ['5/7', '4/8', '6/9', '10/15'], correctAnswer: '5/7', explanation: '5 and 7 share no common factors.' },
      { questionText: 'What is 5/6 - 1/3?', options: ['1/2', '4/6', '2/3', '1/6'], correctAnswer: '1/2', explanation: '5/6 - 2/6 = 3/6 = 1/2.' },
      { questionText: '1/2 + 1/3 + 1/6 equals:', options: ['1', '3/6', '3/11', '2/3'], correctAnswer: '1', explanation: '3/6 + 2/6 + 1/6 = 6/6 = 1.' },
      { questionText: 'What fraction of 20 is 5?', options: ['1/4', '1/5', '4/5', '5/1'], correctAnswer: '1/4', explanation: '5/20 = 1/4.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('integer')) {
    const bank = [
      { questionText: 'What is (-5) + (-3)?', options: ['-8', '8', '-2', '2'], correctAnswer: '-8', explanation: 'Adding two negatives: -5 + (-3) = -8.' },
      { questionText: 'Evaluate: (-12) ÷ 4', options: ['-3', '3', '-48', '48'], correctAnswer: '-3', explanation: 'Negative divided by positive is negative.' },
      { questionText: 'What is 7 - (-3)?', options: ['10', '4', '-10', '-4'], correctAnswer: '10', explanation: 'Subtracting negative is adding: 7+3=10.' },
      { questionText: '(-4) × (-5) equals:', options: ['20', '-20', '9', '-9'], correctAnswer: '20', explanation: 'Negative times negative is positive.' },
      { questionText: 'The absolute value of -15 is:', options: ['15', '-15', '0', '1'], correctAnswer: '15', explanation: 'Absolute value is distance from zero.' },
      { questionText: 'What is (-8) + 12?', options: ['4', '-4', '20', '-20'], correctAnswer: '4', explanation: '12 - 8 = 4 (larger positive wins).' },
      { questionText: 'Evaluate: 6 × (-7)', options: ['-42', '42', '-13', '13'], correctAnswer: '-42', explanation: 'Positive times negative is negative.' },
      { questionText: 'Which is smallest: -3, 0, -5, 2?', options: ['-5', '-3', '0', '2'], correctAnswer: '-5', explanation: 'Further left on number line is smaller.' },
      { questionText: '(-9) - (-4) equals:', options: ['-5', '-13', '5', '13'], correctAnswer: '-5', explanation: '-9 + 4 = -5.' },
      { questionText: 'What is (-2)³?', options: ['-8', '8', '-6', '6'], correctAnswer: '-8', explanation: '(-2)×(-2)×(-2) = 4×(-2) = -8.' },
      { questionText: 'Order from least to greatest: -1, -7, 3, 0', options: ['-7, -1, 0, 3', '-1, -7, 0, 3', '3, 0, -1, -7', '0, -1, -7, 3'], correctAnswer: '-7, -1, 0, 3', explanation: 'Negatives first, then zero, then positives.' },
      { questionText: '(-15) ÷ (-3) equals:', options: ['5', '-5', '45', '-45'], correctAnswer: '5', explanation: 'Negative divided by negative is positive.' },
      { questionText: 'What integer is 5 units left of 2?', options: ['-3', '7', '-7', '3'], correctAnswer: '-3', explanation: '2 - 5 = -3.' },
      { questionText: '|−7| + |3| equals:', options: ['10', '4', '-4', '-10'], correctAnswer: '10', explanation: '7 + 3 = 10.' },
      { questionText: 'What is (-6)²?', options: ['36', '-36', '12', '-12'], correctAnswer: '36', explanation: '(-6)×(-6) = 36.' },
      { questionText: 'Which is greater: -2 or -8?', options: ['-2', '-8', 'Equal', 'Cannot compare'], correctAnswer: '-2', explanation: '-2 is closer to zero, hence greater.' },
      { questionText: '(-10) + 10 equals:', options: ['0', '20', '-20', '100'], correctAnswer: '0', explanation: 'Opposites add to zero.' },
      { questionText: 'What is 0 - 7?', options: ['-7', '7', '0', 'undefined'], correctAnswer: '-7', explanation: '0 - 7 = -7.' },
      { questionText: '(-4) × 0 equals:', options: ['0', '-4', '4', 'undefined'], correctAnswer: '0', explanation: 'Any number times zero is zero.' },
      { questionText: 'The opposite of -9 is:', options: ['9', '-9', '0', '1'], correctAnswer: '9', explanation: 'Opposite has same magnitude, different sign.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('ratio') || lowerContext.includes('proportion')) {
    const bank = [
      {
        questionText: 'Ratio of 8 to 12 in simplest form:',
        options: ['2:3', '3:2', '4:6', '8:12'],
        correctAnswer: '2:3',
        explanation: 'Divide both terms by 4.',
      },
      {
        questionText: 'If 3:5 = x:20, then x =',
        options: ['12', '15', '10', '8'],
        correctAnswer: '12',
        explanation: 'x = (3*20)/5 = 12.',
      },
      {
        questionText: 'Equivalent ratio to 4:7 is:',
        options: ['8:14', '6:14', '12:28', 'Both 8:14 and 12:21'],
        correctAnswer: '8:14',
        explanation: 'Multiply both terms by same number (2).',
      },
      {
        questionText: 'In a class boys:girls = 2:3 and total 25, girls are:',
        options: ['15', '10', '12', '8'],
        correctAnswer: '15',
        explanation: 'Total parts 5, each part 5, girls 3*5=15.',
      },
      {
        questionText: '5 pens cost Rs 40. Cost of 1 pen is:',
        options: ['Rs 8', 'Rs 5', 'Rs 10', 'Rs 6'],
        correctAnswer: 'Rs 8',
        explanation: 'Unitary method: 40/5 = 8.',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('pictograph') || lowerContext.includes('bar graph') || lowerContext.includes('data')) {
    const bank = [
      {
        questionText: 'A bar graph is best used to compare:',
        options: ['Different categories', 'Only decimals', 'Only one value', 'Angles only'],
        correctAnswer: 'Different categories',
        explanation: 'Bar graphs compare quantities across categories.',
      },
      {
        questionText: 'If one symbol in a pictograph represents 5 fruits and 4 symbols are shown, total fruits are:',
        options: ['20', '9', '15', '25'],
        correctAnswer: '20',
        explanation: '4 * 5 = 20.',
      },
      {
        questionText: 'Median of 2, 5, 7 is:',
        options: ['5', '4', '7', '2'],
        correctAnswer: '5',
        explanation: 'Middle value in ordered list is median.',
      },
      {
        questionText: 'Mode is the value that occurs:',
        options: ['Most frequently', 'Least frequently', 'In middle', 'As average only'],
        correctAnswer: 'Most frequently',
        explanation: 'Mode is highest frequency value.',
      },
      {
        questionText: 'For fair comparison in bar graph, bars should have:',
        options: ['Same width and equal scale', 'Random widths', 'No scale', 'Different baselines'],
        correctAnswer: 'Same width and equal scale',
        explanation: 'Consistent formatting ensures accurate interpretation.',
      },
    ]
    return pickFromBank(bank)
  }
  if (lowerContext.includes('equation')) {
    const bank = [
      { questionText: 'Solve for x: 2x + 5 = 17', options: ['6', '7', '5', '4'], correctAnswer: '6', explanation: '2x = 12 so x = 6.' },
      { questionText: 'Which equation matches: "a number decreased by 4 is 11"?', options: ['x - 4 = 11', 'x + 4 = 11', '4x = 11', 'x/4 = 11'], correctAnswer: 'x - 4 = 11', explanation: '"Decreased by 4" means subtraction.' },
      { questionText: 'If 3x - 2 = 13, what is x?', options: ['5', '3', '4', '6'], correctAnswer: '5', explanation: '3x = 15 so x = 5.' },
      { questionText: 'Solve: x/3 + 2 = 5', options: ['9', '3', '6', '12'], correctAnswer: '9', explanation: 'x/3 = 3, therefore x = 9.' },
      { questionText: 'The solution of 5x = 40 is:', options: ['8', '5', '10', '40'], correctAnswer: '8', explanation: 'Divide both sides by 5.' },
      { questionText: 'Solve: 4x - 7 = 21', options: ['7', '6', '8', '5'], correctAnswer: '7', explanation: '4x = 28, so x = 7.' },
      { questionText: 'If 2(x + 3) = 14, find x:', options: ['4', '5', '3', '6'], correctAnswer: '4', explanation: '2x + 6 = 14, 2x = 8, x = 4.' },
      { questionText: 'Solve: 7 - x = 3', options: ['4', '3', '5', '10'], correctAnswer: '4', explanation: 'x = 7 - 3 = 4.' },
      { questionText: 'What is x if 3(x - 2) = 15?', options: ['7', '5', '6', '8'], correctAnswer: '7', explanation: '3x - 6 = 15, 3x = 21, x = 7.' },
      { questionText: 'Solve for x: x/4 = 8', options: ['32', '2', '12', '16'], correctAnswer: '32', explanation: 'Multiply both sides by 4: x = 32.' },
      { questionText: 'If 5x + 3 = 2x + 15, find x:', options: ['4', '5', '3', '6'], correctAnswer: '4', explanation: '5x - 2x = 15 - 3, 3x = 12, x = 4.' },
      { questionText: 'Solve: 6x = 3x + 12', options: ['4', '3', '2', '6'], correctAnswer: '4', explanation: '3x = 12, x = 4.' },
      { questionText: 'What value of x satisfies 9 - 2x = 5?', options: ['2', '3', '1', '4'], correctAnswer: '2', explanation: '-2x = -4, x = 2.' },
      { questionText: 'Solve: (x + 5)/2 = 7', options: ['9', '7', '12', '14'], correctAnswer: '9', explanation: 'x + 5 = 14, x = 9.' },
      { questionText: 'If 8x - 4 = 4x + 12, find x:', options: ['4', '3', '5', '2'], correctAnswer: '4', explanation: '4x = 16, x = 4.' },
      { questionText: 'Solve: 3(2x + 1) = 21', options: ['3', '4', '2', '5'], correctAnswer: '3', explanation: '6x + 3 = 21, 6x = 18, x = 3.' },
      { questionText: 'Find x: 10 - 3x = 1', options: ['3', '2', '4', '5'], correctAnswer: '3', explanation: '-3x = -9, x = 3.' },
      { questionText: 'Solve for x: 2x/5 = 6', options: ['15', '12', '10', '20'], correctAnswer: '15', explanation: '2x = 30, x = 15.' },
      { questionText: 'If 4(x - 1) = 2(x + 3), find x:', options: ['5', '4', '3', '6'], correctAnswer: '5', explanation: '4x - 4 = 2x + 6, 2x = 10, x = 5.' },
      { questionText: 'Solve: x + x/2 = 9', options: ['6', '5', '4', '8'], correctAnswer: '6', explanation: '3x/2 = 9, x = 6.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('triangle') || lowerContext.includes('trigonometry')) {
    const bank = [
      { questionText: 'In a right triangle, if opposite = 3 and hypotenuse = 5, sin(theta) = ?', options: ['3/5', '4/5', '5/3', '2/5'], correctAnswer: '3/5', explanation: 'sin(theta) = opposite / hypotenuse.' },
      { questionText: 'Which statement is true for every triangle?', options: ['Angle sum is 180°', 'All sides are equal', 'One angle is always 90°', 'Area equals perimeter'], correctAnswer: 'Angle sum is 180°', explanation: 'Sum of interior angles in any triangle is 180°.' },
      { questionText: 'If base = 8 and height = 6 in a right triangle, hypotenuse is:', options: ['10', '12', '14', '9'], correctAnswer: '10', explanation: 'sqrt(8^2 + 6^2) = sqrt(100) = 10.' },
      { questionText: 'Which criterion proves triangle congruence?', options: ['SSS', 'AAA only', 'Perimeter', 'Area'], correctAnswer: 'SSS', explanation: 'SSS is a standard congruence criterion.' },
      { questionText: 'tan(theta) equals:', options: ['opposite/adjacent', 'adjacent/opposite', 'hypotenuse/opposite', 'opposite/hypotenuse'], correctAnswer: 'opposite/adjacent', explanation: 'tan(theta) = opposite divided by adjacent.' },
      { questionText: 'What is cos(60°)?', options: ['1/2', '√3/2', '1', '0'], correctAnswer: '1/2', explanation: 'cos(60°) = 1/2 is a standard value.' },
      { questionText: 'In triangle ABC, if angle A = 50° and angle B = 60°, angle C = ?', options: ['70°', '80°', '90°', '60°'], correctAnswer: '70°', explanation: '180° - 50° - 60° = 70°.' },
      { questionText: 'The value of sin(30°) is:', options: ['1/2', '√3/2', '1/√2', '1'], correctAnswer: '1/2', explanation: 'sin(30°) = 1/2 is a standard trigonometric value.' },
      { questionText: 'If tan(θ) = 1, then θ = ?', options: ['45°', '30°', '60°', '90°'], correctAnswer: '45°', explanation: 'tan(45°) = 1.' },
      { questionText: 'In a right triangle with legs 5 and 12, what is the hypotenuse?', options: ['13', '17', '15', '14'], correctAnswer: '13', explanation: 'sqrt(25 + 144) = sqrt(169) = 13.' },
      { questionText: 'cos(0°) equals:', options: ['1', '0', '-1', '1/2'], correctAnswer: '1', explanation: 'cos(0°) = 1.' },
      { questionText: 'Which triangle has all angles less than 90°?', options: ['Acute triangle', 'Right triangle', 'Obtuse triangle', 'Scalene only'], correctAnswer: 'Acute triangle', explanation: 'Acute triangles have all angles < 90°.' },
      { questionText: 'sin²(θ) + cos²(θ) = ?', options: ['1', '0', '2', 'tan²(θ)'], correctAnswer: '1', explanation: 'This is the Pythagorean identity.' },
      { questionText: 'What is sin(90°)?', options: ['1', '0', '-1', '1/2'], correctAnswer: '1', explanation: 'sin(90°) = 1.' },
      { questionText: 'If opposite = 4 and adjacent = 3, what is tan(θ)?', options: ['4/3', '3/4', '5/3', '3/5'], correctAnswer: '4/3', explanation: 'tan(θ) = opposite/adjacent = 4/3.' },
      { questionText: 'The exterior angle of a triangle equals:', options: ['Sum of two interior opposite angles', 'Sum of all angles', 'One interior angle', 'Half the sum'], correctAnswer: 'Sum of two interior opposite angles', explanation: 'Exterior angle theorem.' },
      { questionText: 'What is cos(90°)?', options: ['0', '1', '-1', '1/2'], correctAnswer: '0', explanation: 'cos(90°) = 0.' },
      { questionText: 'In an equilateral triangle, each angle measures:', options: ['60°', '90°', '45°', '120°'], correctAnswer: '60°', explanation: '180°/3 = 60° for equilateral triangle.' },
      { questionText: 'sec(θ) is the reciprocal of:', options: ['cos(θ)', 'sin(θ)', 'tan(θ)', 'cot(θ)'], correctAnswer: 'cos(θ)', explanation: 'sec(θ) = 1/cos(θ).' },
      { questionText: 'What type of triangle has sides 3, 4, 5?', options: ['Right triangle', 'Equilateral', 'Isosceles', 'Obtuse'], correctAnswer: 'Right triangle', explanation: '3² + 4² = 5², satisfies Pythagorean theorem.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('comparing quantities') || lowerContext.includes('percentage') || lowerContext.includes('interest') || lowerContext.includes('profit')) {
    const bank = [
      { questionText: 'A shirt marked Rs 1000 is sold at 10% discount. Selling price is:', options: ['Rs 900', 'Rs 1100', 'Rs 990', 'Rs 100'], correctAnswer: 'Rs 900', explanation: 'Discount = 1000×0.1 = 100, SP = 900.' },
      { questionText: 'If CP = Rs 500 and profit = 20%, then SP is:', options: ['Rs 600', 'Rs 400', 'Rs 520', 'Rs 625'], correctAnswer: 'Rs 600', explanation: 'SP = 500 × 1.2 = 600.' },
      { questionText: 'Express 3/4 as a percentage:', options: ['75%', '34%', '43%', '25%'], correctAnswer: '75%', explanation: '3/4 × 100 = 75%.' },
      { questionText: 'Simple interest on Rs 2000 at 5% for 2 years is:', options: ['Rs 200', 'Rs 100', 'Rs 400', 'Rs 500'], correctAnswer: 'Rs 200', explanation: 'SI = P×R×T/100 = 2000×5×2/100 = 200.' },
      { questionText: 'If loss is 10% and CP is Rs 800, SP is:', options: ['Rs 720', 'Rs 880', 'Rs 80', 'Rs 710'], correctAnswer: 'Rs 720', explanation: 'SP = 800 × 0.9 = 720.' },
      { questionText: '25% of 80 is:', options: ['20', '25', '55', '40'], correctAnswer: '20', explanation: '25/100 × 80 = 20.' },
      { questionText: 'A price increases from Rs 50 to Rs 60. Percentage increase:', options: ['20%', '10%', '16.67%', '25%'], correctAnswer: '20%', explanation: '(60-50)/50 × 100 = 20%.' },
      { questionText: 'If SP = Rs 450 and profit = 50%, CP was:', options: ['Rs 300', 'Rs 225', 'Rs 675', 'Rs 400'], correctAnswer: 'Rs 300', explanation: 'CP = SP/1.5 = 450/1.5 = 300.' },
      { questionText: 'What is 15% of 200?', options: ['30', '15', '170', '185'], correctAnswer: '30', explanation: '15/100 × 200 = 30.' },
      { questionText: 'Compound interest compounds:', options: ['Interest on principal + accumulated interest', 'Only on principal', 'Never', 'Once only'], correctAnswer: 'Interest on principal + accumulated interest', explanation: 'CI adds interest to principal each period.' },
      { questionText: 'If marked price is Rs 500 and discount is Rs 75, discount % is:', options: ['15%', '75%', '7.5%', '25%'], correctAnswer: '15%', explanation: '75/500 × 100 = 15%.' },
      { questionText: '40% of what number is 20?', options: ['50', '8', '80', '200'], correctAnswer: '50', explanation: 'x × 0.4 = 20, so x = 50.' },
      { questionText: 'Profit % when CP=Rs 200, SP=Rs 250:', options: ['25%', '50%', '20%', '80%'], correctAnswer: '25%', explanation: '(50/200) × 100 = 25%.' },
      { questionText: 'A population of 10000 decreases by 5%. New population:', options: ['9500', '10500', '9000', '500'], correctAnswer: '9500', explanation: '10000 × 0.95 = 9500.' },
      { questionText: 'Rs 1500 at 10% CI for 2 years gives amount:', options: ['Rs 1815', 'Rs 1800', 'Rs 1650', 'Rs 1500'], correctAnswer: 'Rs 1815', explanation: 'A = 1500(1.1)² = 1500×1.21 = 1815.' },
      { questionText: 'If you buy at Rs 80 and sell at Rs 100, profit % is:', options: ['25%', '20%', '80%', '100%'], correctAnswer: '25%', explanation: '(20/80) × 100 = 25%.' },
      { questionText: 'Express 0.05 as percentage:', options: ['5%', '0.5%', '50%', '0.05%'], correctAnswer: '5%', explanation: '0.05 × 100 = 5%.' },
      { questionText: 'Loss % if CP=Rs 250, SP=Rs 200:', options: ['20%', '25%', '50%', '80%'], correctAnswer: '20%', explanation: '(50/250) × 100 = 20%.' },
      { questionText: 'What percent of 50 is 10?', options: ['20%', '10%', '5%', '40%'], correctAnswer: '20%', explanation: '(10/50) × 100 = 20%.' },
      { questionText: 'Two successive discounts of 10% and 20% on Rs 1000:', options: ['Rs 720', 'Rs 700', 'Rs 730', 'Rs 800'], correctAnswer: 'Rs 720', explanation: '1000×0.9×0.8 = 720.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('electric') || lowerContext.includes("ohm")) {
    const bank = [
      { questionText: 'Ohm\'s law states:', options: ['V = IR', 'V = I/R', 'V = I + R', 'V = I - R'], correctAnswer: 'V = IR', explanation: 'Voltage equals current times resistance.' },
      { questionText: 'The SI unit of resistance is:', options: ['Ohm (Ω)', 'Ampere', 'Volt', 'Watt'], correctAnswer: 'Ohm (Ω)', explanation: 'Resistance is measured in ohms.' },
      { questionText: 'If V=12V and I=3A, then R=', options: ['4Ω', '36Ω', '9Ω', '15Ω'], correctAnswer: '4Ω', explanation: 'R = V/I = 12/3 = 4Ω.' },
      { questionText: 'Electric current is measured in:', options: ['Amperes', 'Volts', 'Ohms', 'Watts'], correctAnswer: 'Amperes', explanation: 'Current unit is ampere (A).' },
      { questionText: 'In a series circuit, current is:', options: ['Same throughout', 'Different at each point', 'Zero', 'Infinite'], correctAnswer: 'Same throughout', explanation: 'Series circuits have constant current.' },
      { questionText: 'Power P = VI. If V=10V and I=2A, P=', options: ['20W', '5W', '12W', '8W'], correctAnswer: '20W', explanation: 'P = 10 × 2 = 20 watts.' },
      { questionText: 'Two 4Ω resistors in series have total resistance:', options: ['8Ω', '2Ω', '4Ω', '16Ω'], correctAnswer: '8Ω', explanation: 'Series: R_total = R1 + R2 = 8Ω.' },
      { questionText: 'The unit of electric potential is:', options: ['Volt', 'Ampere', 'Coulomb', 'Joule'], correctAnswer: 'Volt', explanation: 'Potential difference measured in volts.' },
      { questionText: 'Two 4Ω resistors in parallel have total resistance:', options: ['2Ω', '8Ω', '4Ω', '1Ω'], correctAnswer: '2Ω', explanation: 'Parallel: 1/R = 1/4 + 1/4, R = 2Ω.' },
      { questionText: 'Electric energy is measured in:', options: ['Joules or kWh', 'Amperes', 'Volts', 'Ohms'], correctAnswer: 'Joules or kWh', explanation: 'Energy in joules, billed in kWh.' },
      { questionText: 'What does a fuse protect against?', options: ['Overcurrent', 'Undervoltage', 'Low resistance', 'Magnetism'], correctAnswer: 'Overcurrent', explanation: 'Fuse melts when current exceeds safe limit.' },
      { questionText: 'Conductors have:', options: ['Low resistance', 'High resistance', 'No current flow', 'Infinite resistance'], correctAnswer: 'Low resistance', explanation: 'Conductors allow easy current flow.' },
      { questionText: 'If power is 100W for 2 hours, energy used is:', options: ['200Wh', '50Wh', '100Wh', '102Wh'], correctAnswer: '200Wh', explanation: 'Energy = Power × Time = 100 × 2 = 200Wh.' },
      { questionText: '1 kilowatt-hour equals:', options: ['3.6 × 10⁶ J', '3600 J', '1000 J', '60 J'], correctAnswer: '3.6 × 10⁶ J', explanation: '1kWh = 1000W × 3600s = 3.6MJ.' },
      { questionText: 'Which material is a good insulator?', options: ['Rubber', 'Copper', 'Silver', 'Aluminum'], correctAnswer: 'Rubber', explanation: 'Rubber has very high resistance.' },
      { questionText: 'In parallel circuit, voltage is:', options: ['Same across all branches', 'Different in each branch', 'Zero', 'Maximum in one branch'], correctAnswer: 'Same across all branches', explanation: 'Parallel components share same voltage.' },
      { questionText: 'P = I²R. If I=3A and R=2Ω, P=', options: ['18W', '6W', '9W', '12W'], correctAnswer: '18W', explanation: 'P = 9 × 2 = 18W.' },
      { questionText: 'What is the function of a switch?', options: ['Open/close circuit', 'Increase current', 'Store energy', 'Measure voltage'], correctAnswer: 'Open/close circuit', explanation: 'Switch controls circuit continuity.' },
      { questionText: 'EMF stands for:', options: ['Electromotive Force', 'Electric Moving Force', 'Electromagnetic Field', 'Energy Motion Force'], correctAnswer: 'Electromotive Force', explanation: 'EMF is the voltage provided by a source.' },
      { questionText: 'Resistance increases with:', options: ['Length of wire', 'Cross-sectional area', 'Better conductor material', 'Lower temperature'], correctAnswer: 'Length of wire', explanation: 'R ∝ length, longer wire = more resistance.' },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('algorithm') || lowerContext.includes('programming') || lowerContext.includes('data structures')) {
    if (questionIndex === 1) {
      return {
        questionText: 'Time complexity of binary search on sorted data is:',
        options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 'O(log n)',
        explanation: 'Binary search halves the search range each step.',
      }
    }
    if (questionIndex === 2) {
      return {
        questionText: 'Which data structure follows LIFO?',
        options: ['Stack', 'Queue', 'Heap', 'Tree'],
        correctAnswer: 'Stack',
        explanation: 'LIFO means Last-In, First-Out, i.e. stack.',
      }
    }
    return {
      questionText: 'Which C statement supports multi-way branching?',
      options: ['switch', 'for', 'while', 'goto'],
      correctAnswer: 'switch',
      explanation: 'switch is used for multi-way selection based on cases.',
    }
  }

  if (lowerContext.includes('thermodynamics') || lowerContext.includes('heat')) {
    if (questionIndex === 1) {
      return {
        questionText: 'Heat naturally flows from:',
        options: ['Hot body to cold body', 'Cold body to hot body', 'Only vacuum to solid', 'Equal temperature to higher temperature'],
        correctAnswer: 'Hot body to cold body',
        explanation: 'Spontaneous heat transfer is from higher to lower temperature.',
      }
    }
    if (questionIndex === 2) {
      return {
        questionText: 'Which is a state function?',
        options: ['Internal energy', 'Work', 'Heat', 'Path length'],
        correctAnswer: 'Internal energy',
        explanation: 'State functions depend only on state, not path.',
      }
    }
    return {
      questionText: 'First law of thermodynamics is conservation of:',
      options: ['Energy', 'Pressure', 'Entropy only', 'Volume only'],
      correctAnswer: 'Energy',
      explanation: 'The first law states energy cannot be created or destroyed.',
    }
  }

  if (lowerContext.includes('signal') || lowerContext.includes('communication') || lowerContext.includes('network')) {
    if (questionIndex === 1) {
      return {
        questionText: 'Which OSI layer handles routing?',
        options: ['Network layer', 'Transport layer', 'Data link layer', 'Session layer'],
        correctAnswer: 'Network layer',
        explanation: 'Routing and logical addressing are network layer functions.',
      }
    }
    if (questionIndex === 2) {
      return {
        questionText: 'Nyquist rate for a 4kHz signal is:',
        options: ['8kHz', '4kHz', '2kHz', '16kHz'],
        correctAnswer: '8kHz',
        explanation: 'Nyquist rate is 2f for maximum frequency f.',
      }
    }
    return {
      questionText: 'Which protocol is connection-oriented?',
      options: ['TCP', 'UDP', 'IP', 'ICMP'],
      correctAnswer: 'TCP',
      explanation: 'TCP establishes connection and ensures reliable delivery.',
    }
  }

  if (lowerContext.includes('biology') || lowerContext.includes('cell') || lowerContext.includes('inheritance')) {
    if (questionIndex === 1) {
      return {
        questionText: 'Powerhouse of the cell is:',
        options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi body'],
        correctAnswer: 'Mitochondria',
        explanation: 'Mitochondria generate ATP for cell activities.',
      }
    }
    if (questionIndex === 2) {
      return {
        questionText: 'DNA is primarily present in:',
        options: ['Nucleus', 'Cell membrane', 'Cell wall', 'Vacuole'],
        correctAnswer: 'Nucleus',
        explanation: 'In eukaryotic cells, DNA is mainly in nucleus.',
      }
    }
    return {
      questionText: 'In Mendelian genetics, a trait expressed in F1 generation is usually:',
      options: ['Dominant', 'Recessive', 'Acquired', 'Mutated only'],
      correctAnswer: 'Dominant',
      explanation: 'Dominant traits mask recessive ones in heterozygous state.',
    }
  }

  if (lowerContext.includes('government') || lowerContext.includes('democracy') || lowerContext.includes('constitution') || lowerContext.includes('civic')) {
    if (questionIndex === 1) {
      return {
        questionText: 'A key feature of democracy is:',
        options: ['Free and fair elections', 'Rule of one person', 'No accountability', 'No citizen rights'],
        correctAnswer: 'Free and fair elections',
        explanation: 'Democracy requires representative choice through elections.',
      }
    }
    if (questionIndex === 2) {
      return {
        questionText: 'The Constitution mainly defines:',
        options: ['Structure and powers of government', 'Only tax collection', 'Only school curriculum', 'Only election dates'],
        correctAnswer: 'Structure and powers of government',
        explanation: 'It defines institutions, powers and rights.',
      }
    }
    return {
      questionText: 'Rural local self-government system in India is called:',
      options: ['Panchayati Raj', 'Lok Sabha', 'Rajya Sabha', 'Supreme Court'],
      correctAnswer: 'Panchayati Raj',
      explanation: 'Panchayati Raj institutions govern at local rural levels.',
    }
  }

  if (lowerContext.includes('history') || lowerContext.includes('mughal') || lowerContext.includes('sultans') || lowerContext.includes('revolution') || lowerContext.includes('nationalism')) {
    if (questionIndex === 1) {
      return {
        questionText: 'Timeline in history helps to:',
        options: ['Understand sequence of events', 'Ignore causes', 'Remove context', 'Memorize only names'],
        correctAnswer: 'Understand sequence of events',
        explanation: 'Chronology helps understand event progression and links.',
      }
    }
    if (questionIndex === 2) {
      return {
        questionText: 'A primary historical source is:',
        options: ['Inscription', 'Modern meme', 'Fiction summary', 'Random post'],
        correctAnswer: 'Inscription',
        explanation: 'Primary sources are direct records from the period.',
      }
    }
    return {
      questionText: 'Nationalism movements mainly aimed to:',
      options: ['Build collective identity and self-rule', 'Promote colonial dependence', 'Reduce participation', 'End rights'],
      correctAnswer: 'Build collective identity and self-rule',
      explanation: 'Nationalism promoted shared identity and political freedom.',
    }
  }

  if (lowerContext.includes('hindi')) {
    const bank = [
      {
        questionText: `"${chapterName}" के संदर्भ में मुख्य भाव पहचानने का सही तरीका क्या है?`,
        options: ['शीर्षक, प्रसंग और मुख्य विचार को साथ पढ़ना', 'केवल पहला वाक्य पढ़ना', 'केवल कठिन शब्द याद करना', 'अंतिम पंक्ति छोड़ देना'],
        correctAnswer: 'शीर्षक, प्रसंग और मुख्य विचार को साथ पढ़ना',
        explanation: 'मुख्य भाव समझने के लिए प्रसंग और विचार-धारा दोनों देखनी होती है।',
      },
      {
        questionText: 'मुहावरा किसका उदाहरण है?',
        options: ['लाक्षणिक प्रयोग', 'केवल विराम-चिह्न', 'संख्या-सूची', 'काल का नियम'],
        correctAnswer: 'लाक्षणिक प्रयोग',
        explanation: 'मुहावरे का अर्थ शब्दार्थ से नहीं, प्रचलित प्रयोग से समझा जाता है।',
      },
      {
        questionText: 'गद्यांश के लिए सबसे उपयुक्त सार-वाक्य कैसे चुना जाता है?',
        options: ['जो पूरे अनुच्छेद का केंद्रीय विचार बताता हो', 'जो सबसे लंबा हो', 'जिसमें कठिन शब्द हों', 'जो केवल उदाहरण बताए'],
        correctAnswer: 'जो पूरे अनुच्छेद का केंद्रीय विचार बताता हो',
        explanation: 'सार-वाक्य संपूर्ण विचार का संक्षिप्त और सटीक प्रतिनिधित्व करता है।',
      },
      {
        questionText: `"${conceptName}" पढ़ाते समय कौन-सा कौशल सबसे अधिक विकसित होता है?`,
        options: ['अर्थ-ग्रहण और अभिव्यक्ति', 'केवल गणना', 'केवल आरेख बनाना', 'केवल सूत्र याद करना'],
        correctAnswer: 'अर्थ-ग्रहण और अभिव्यक्ति',
        explanation: 'भाषा-अध्ययन का मूल लक्ष्य समझ और अभिव्यक्ति दोनों है।',
      },
      {
        questionText: 'सही वाक्य-विन्यास पहचानिए:',
        options: ['विषय, क्रिया और कर्म में स्पष्ट संबंध', 'शब्दों का यादृच्छिक क्रम', 'केवल विशेषणों का समूह', 'बिना क्रिया का वाक्य'],
        correctAnswer: 'विषय, क्रिया और कर्म में स्पष्ट संबंध',
        explanation: 'सही वाक्य-विन्यास से अर्थ स्पष्ट और सुसंगत बनता है।',
      },
      {
        questionText: 'कविता-पंक्तियों की व्याख्या करते समय सबसे पहले क्या करना चाहिए?',
        options: ['प्रसंग और भावार्थ समझना', 'केवल तुक पहचानना', 'हर शब्द का शाब्दिक अनुवाद', 'कविता की अंतिम पंक्ति हटाना'],
        correctAnswer: 'प्रसंग और भावार्थ समझना',
        explanation: 'कविता का अर्थ संदर्भ और भाव से स्पष्ट होता है।',
      },
      {
        questionText: `"${moduleName}" में शब्दार्थ प्रश्न का अच्छा उत्तर किस प्रकार होगा?`,
        options: ['शब्द + प्रसंगानुसार अर्थ + छोटा उदाहरण', 'सिर्फ शब्द लिखना', 'सिर्फ पर्यायवाची', 'अप्रासंगिक कहानी'],
        correctAnswer: 'शब्द + प्रसंगानुसार अर्थ + छोटा उदाहरण',
        explanation: 'प्रसंगानुसार अर्थ के साथ उदाहरण देने से उत्तर पूर्ण होता है।',
      },
      {
        questionText: 'अनुच्छेद-लेखन का उपयुक्त निष्कर्ष क्या करेगा?',
        options: ['मुख्य संदेश को समेटेगा', 'नया असंबंधित विषय शुरू करेगा', 'केवल शीर्षक दोहराएगा', 'कोई निष्कर्ष नहीं देगा'],
        correctAnswer: 'मुख्य संदेश को समेटेगा',
        explanation: 'निष्कर्ष लेखन को पूर्णता देता है और संदेश को मजबूत करता है।',
      },
    ]
    return pickFromBank(bank)
  }

  if (lowerContext.includes('reading') || lowerContext.includes('literary') || lowerContext.includes('language') || lowerContext.includes('english')) {
    const bank = [
      {
        questionText: 'The best first step for comprehension is to:',
        options: ['identify central idea and supporting clues', 'memorize difficult words only', 'skip the opening paragraph', 'read options before passage only'],
        correctAnswer: 'identify central idea and supporting clues',
        explanation: 'Strong comprehension starts with theme + supporting evidence.',
      },
      {
        questionText: 'A metaphor is best defined as:',
        options: ['a direct comparison without using like/as', 'a punctuation symbol', 'a tense marker', 'a list format'],
        correctAnswer: 'a direct comparison without using like/as',
        explanation: 'Metaphor creates imagery by direct comparison.',
      },
      {
        questionText: `For "${conceptName}", which response style is strongest in a short-answer question?`,
        options: ['claim + evidence from text + brief inference', 'one-word answer only', 'copy full paragraph without reasoning', 'unrelated personal story'],
        correctAnswer: 'claim + evidence from text + brief inference',
        explanation: 'Evidence-backed inference demonstrates understanding.',
      },
      {
        questionText: 'Tone in a passage is mainly identified through:',
        options: ['word choice and sentence mood', 'font size', 'paragraph length only', 'page number'],
        correctAnswer: 'word choice and sentence mood',
        explanation: 'Diction and sentence style reveal tone.',
      },
      {
        questionText: 'A strong paragraph conclusion should:',
        options: ['reinforce the main message', 'introduce an unrelated argument', 'repeat random details', 'avoid closure completely'],
        correctAnswer: 'reinforce the main message',
        explanation: 'Good conclusions synthesize and close the idea clearly.',
      },
      {
        questionText: 'Vocabulary-in-context questions are solved best by:',
        options: ['reading surrounding sentences for meaning clues', 'guessing without context', 'choosing the longest option', 'ignoring the sentence'],
        correctAnswer: 'reading surrounding sentences for meaning clues',
        explanation: 'Contextual clues provide the most reliable meaning.',
      },
      {
        questionText: 'Which option shows effective summary writing?',
        options: ['captures key points concisely without extra details', 'copies the passage line by line', 'adds unrelated examples', 'focuses on minor details only'],
        correctAnswer: 'captures key points concisely without extra details',
        explanation: 'A summary should be concise and faithful to core ideas.',
      },
      {
        questionText: 'When comparing two characters, the best evidence comes from:',
        options: ['actions, dialogue, and narrative details', 'title formatting', 'chapter numbering only', 'illustration size'],
        correctAnswer: 'actions, dialogue, and narrative details',
        explanation: 'Character comparison must be text-grounded.',
      },
    ]
    return pickFromBank(bank)
  }

  // Improved fallback: generate varied question types based on questionIndex
  const questionTemplates = [
    {
      questionText: `What is the primary focus of ${conceptName}?`,
      correct: `Understanding and applying ${conceptName} principles`,
      distractors: [`Memorizing unrelated facts`, `Ignoring ${chapterName} entirely`, `Skipping foundational concepts`],
    },
    {
      questionText: `Which best describes the role of ${conceptName} in ${chapterName}?`,
      correct: `It provides essential knowledge for ${moduleName}`,
      distractors: [`It is optional and rarely used`, `It contradicts other concepts`, `It has no connection to ${chapterName}`],
    },
    {
      questionText: `When studying ${conceptName}, what should be prioritized?`,
      correct: `Understanding core principles and their applications`,
      distractors: [`Only memorizing formulas without understanding`, `Skipping practice problems`, `Avoiding related concepts`],
    },
    {
      questionText: `How does ${conceptName} relate to ${moduleName}?`,
      correct: `${conceptName} is a fundamental building block of ${moduleName}`,
      distractors: [`They are completely unrelated topics`, `${conceptName} replaces ${moduleName}`, `No relationship exists`],
    },
    {
      questionText: `What is a key characteristic of ${conceptName}?`,
      correct: `It builds upon prerequisite knowledge systematically`,
      distractors: [`It requires no prior knowledge`, `It cannot be learned progressively`, `It exists in isolation`],
    },
    {
      questionText: `Why is ${conceptName} important in ${subjectName}?`,
      correct: `It forms the foundation for advanced topics`,
      distractors: [`It is only for beginners`, `It has no practical use`, `It is outdated material`],
    },
    {
      questionText: `What approach works best for mastering ${conceptName}?`,
      correct: `Practice with varied problems and review explanations`,
      distractors: [`Read once without practice`, `Skip difficult problems`, `Memorize without understanding`],
    },
    {
      questionText: `Which skill is developed through studying ${conceptName}?`,
      correct: `Analytical thinking and problem-solving`,
      distractors: [`Only rote memorization`, `No transferable skills`, `Unrelated abilities`],
    },
    {
      questionText: `In the context of ${chapterName}, ${conceptName} helps with:`,
      correct: `Building a strong foundation for related topics`,
      distractors: [`Nothing specific`, `Only exam preparation`, `Unrelated subjects only`],
    },
    {
      questionText: `A student struggling with ${conceptName} should:`,
      correct: `Review prerequisites and practice step by step`,
      distractors: [`Skip to advanced topics`, `Give up on ${chapterName}`, `Avoid asking questions`],
    },
    {
      questionText: `The connection between ${conceptName} and ${moduleName} is:`,
      correct: `${conceptName} provides necessary skills for ${moduleName}`,
      distractors: [`There is no connection`, `They conflict with each other`, `${moduleName} replaces ${conceptName}`],
    },
    {
      questionText: `What makes ${conceptName} essential in ${subjectName}?`,
      correct: `It enables understanding of more complex topics`,
      distractors: [`It is purely theoretical`, `It has limited applications`, `It is not essential`],
    },
    {
      questionText: `To apply ${conceptName} effectively, one must:`,
      correct: `Understand the underlying principles thoroughly`,
      distractors: [`Only memorize examples`, `Ignore theory completely`, `Skip practice exercises`],
    },
    {
      questionText: `${conceptName} is best learned by:`,
      correct: `Combining theory with practical application`,
      distractors: [`Reading without doing`, `Skipping explanations`, `Avoiding challenges`],
    },
    {
      questionText: `What foundation does ${conceptName} provide?`,
      correct: `Skills needed for advanced study in ${chapterName}`,
      distractors: [`No foundation for anything`, `Only basic knowledge`, `Unrelated skills`],
    },
    {
      questionText: `Understanding ${conceptName} requires:`,
      correct: `Active engagement and regular practice`,
      distractors: [`Passive reading only`, `No effort`, `Avoiding questions`],
    },
    {
      questionText: `${conceptName} in ${moduleName} demonstrates:`,
      correct: `How foundational concepts connect to applications`,
      distractors: [`Random unrelated facts`, `No clear purpose`, `Outdated information`],
    },
    {
      questionText: `The study of ${conceptName} develops:`,
      correct: `Critical thinking applicable to ${subjectName}`,
      distractors: [`No useful skills`, `Only test-taking ability`, `Irrelevant knowledge`],
    },
    {
      questionText: `Progress in ${conceptName} is measured by:`,
      correct: `Ability to solve varied problems independently`,
      distractors: [`Memorization of answers`, `Speed without accuracy`, `Avoiding difficult questions`],
    },
    {
      questionText: `Mastery of ${conceptName} leads to:`,
      correct: `Confidence in tackling ${chapterName} challenges`,
      distractors: [`No improvement`, `Confusion in related topics`, `Decreased understanding`],
    },
  ]

  const template = questionTemplates[(questionIndex - 1) % questionTemplates.length]
  const allOptions = [template.correct, ...template.distractors]
  
  // Rotate correct answer position based on questionIndex
  const rotations = [
    [0, 1, 2, 3], // correct at A
    [1, 0, 2, 3], // correct at B  
    [1, 2, 0, 3], // correct at C
    [1, 2, 3, 0], // correct at D
  ]
  const rotation = rotations[questionIndex % 4]
  const options = rotation.map(i => allOptions[i])

  return {
    questionText: template.questionText,
    options,
    correctAnswer: template.correct,
    explanation: `${conceptName} is a key component of ${moduleName} in ${chapterName}, building essential skills for ${subjectName}.`,
  }
}

function buildGeneratedLearningArtifacts(
  subjects: Subject[],
  chapters: Chapter[],
  modules: Module[],
): Pick<ProgramCatalogEntry, 'concepts' | 'conceptDependencies' | 'questions' | 'quizzes'> {
  const concepts: Concept[] = []
  const conceptDependencies: ConceptDependency[] = []
  const questions: Question[] = []
  const quizzes: Quiz[] = []
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject.name]))
  const chapterQuestionIds = new Map<string, string[]>()
  const moduleQuestionIds = new Map<string, string[]>()

  for (const chapter of chapters) {
    const chapterModules = modules.filter((module) => module.chapterId === chapter.id)
    let previousConceptId: string | null = null
    const subjectName = subjectById.get(chapter.subjectId) || 'General'

    for (const module of chapterModules) {
      const [conceptNameA, conceptNameB] = moduleConceptNames(subjectName, chapter.name, module.name)
      const conceptNames = [conceptNameA, conceptNameB]

      for (let conceptIndex = 1; conceptIndex <= 2; conceptIndex += 1) {
        const conceptId = `concept.${module.id}.${conceptIndex}`
        const conceptName = conceptNames[conceptIndex - 1]
        const accuracy = Math.max(0.3, 0.8 - (conceptIndex * 0.1))

        concepts.push({
          id: conceptId,
          name: conceptName,
          subject: subjectName,
          chapter: chapter.name,
          module: module.name,
          description: `${conceptName} in ${module.name}, under ${chapter.name}.`,
          status: accuracy >= 0.8 ? 'mastered' : accuracy >= 0.5 ? 'weak' : 'missing',
          accuracy,
        })

        if (previousConceptId) {
          conceptDependencies.push({
            id: `dep.${previousConceptId}.${conceptId}`,
            parentConceptId: previousConceptId,
            childConceptId: conceptId,
          })
        }
        previousConceptId = conceptId

        for (let questionIndex = 1; questionIndex <= 20; questionIndex += 1) {
          const questionId = `q.${conceptId}.${questionIndex}`
          const topicAware = buildTopicAwareQuestion(
            subjectName,
            chapter.name,
            module.name,
            conceptName,
            questionIndex,
          )
          questions.push({
            id: questionId,
            questionText: topicAware.questionText,
            options: topicAware.options,
            correctAnswer: topicAware.correctAnswer,
            difficulty: questionIndex <= 6 ? 'easy' : questionIndex <= 14 ? 'medium' : 'hard',
            explanation: topicAware.explanation,
            conceptIds: [conceptId],
            scopeType: 'concept',
            scopeId: conceptId,
            misconceptionTag: 'conceptual-gap',
            questionType: 'mcq',
          })
          const moduleQuestions = moduleQuestionIds.get(module.id) ?? []
          moduleQuestions.push(questionId)
          moduleQuestionIds.set(module.id, moduleQuestions)

          const chapterQuestions = chapterQuestionIds.get(chapter.id) ?? []
          chapterQuestions.push(questionId)
          chapterQuestionIds.set(chapter.id, chapterQuestions)
        }

        quizzes.push({
          id: `quiz.${conceptId}`,
          scopeType: 'concept',
          scopeId: conceptId,
          questionIds: Array.from({ length: 20 }, (_, index) => `q.${conceptId}.${index + 1}`),
        })
      }

      quizzes.push({
        id: `quiz.${module.id}`,
        scopeType: 'module',
        scopeId: module.id,
        questionIds: moduleQuestionIds.get(module.id) ?? [],
      })
    }

    quizzes.push({
      id: `quiz.${chapter.id}`,
      scopeType: 'chapter',
      scopeId: chapter.id,
      questionIds: chapterQuestionIds.get(chapter.id) ?? [],
    })
  }

  return { concepts, conceptDependencies, questions, quizzes }
}

function ensureMinimumChapterQuestionCoverage(
  program: ProgramCatalogEntry,
  minimumPerChapter: number,
): ProgramCatalogEntry {
  const questions = [...program.questions]
  const quizzes = [...program.quizzes]
  const questionIds = new Set(questions.map((question) => question.id))

  const chapterById = new Map(program.chapters.map((chapter) => [chapter.id, chapter]))
  const moduleById = new Map(program.modules.map((module) => [module.id, module]))
  const subjectById = new Map(program.subjects.map((subject) => [subject.id, subject.name]))
  const conceptById = new Map(program.concepts.map((concept) => [concept.id, concept]))

  const chapterConcepts = new Map<string, Concept[]>()
  for (const chapter of program.chapters) {
    const subjectName = subjectById.get(chapter.subjectId) || 'General'
    chapterConcepts.set(
      chapter.id,
      program.concepts.filter((concept) => concept.chapter === chapter.name && concept.subject === subjectName),
    )
  }

  const chapterQuestionIds = new Map<string, string[]>()
  for (const chapter of program.chapters) chapterQuestionIds.set(chapter.id, [])

  for (const question of questions) {
    let chapterId: string | undefined
    if (question.scopeType === 'chapter' && question.scopeId) {
      chapterId = question.scopeId
    } else if (question.scopeType === 'module' && question.scopeId) {
      chapterId = moduleById.get(question.scopeId)?.chapterId
    } else if (question.scopeType === 'concept' && question.scopeId) {
      const concept = conceptById.get(question.scopeId)
      if (concept) {
        const matchedChapter = program.chapters.find((chapter) => {
          const subjectName = subjectById.get(chapter.subjectId) || 'General'
          return chapter.name === concept.chapter && subjectName === concept.subject
        })
        chapterId = matchedChapter?.id
      }
    }

    if (!chapterId) continue
    const ids = chapterQuestionIds.get(chapterId) ?? []
    ids.push(question.id)
    chapterQuestionIds.set(chapterId, ids)
  }

  for (const chapter of program.chapters) {
    const chapterIds = chapterQuestionIds.get(chapter.id) ?? []
    const conceptsInChapter = chapterConcepts.get(chapter.id) ?? []
    if (conceptsInChapter.length === 0) continue
    if (chapterIds.length >= minimumPerChapter) continue

    const subjectName = subjectById.get(chapter.subjectId) || 'General'
    const needed = minimumPerChapter - chapterIds.length

    for (let offset = 0; offset < needed; offset += 1) {
      const concept = conceptsInChapter[offset % conceptsInChapter.length]
      const moduleName = concept.module || chapter.name
      const questionIndex = chapterIds.length + offset + 1
      const topicAware = buildTopicAwareQuestion(
        subjectName,
        chapter.name,
        moduleName,
        concept.name,
        questionIndex,
      )

      let questionId = `q.${chapter.id}.extra.${questionIndex}`
      while (questionIds.has(questionId)) {
        questionId = `${questionId}.x`
      }

      const generatedQuestion: Question = {
        id: questionId,
        questionText: topicAware.questionText,
        options: topicAware.options,
        correctAnswer: topicAware.correctAnswer,
        difficulty: questionIndex <= 14 ? 'easy' : questionIndex <= 28 ? 'medium' : 'hard',
        explanation: topicAware.explanation,
        conceptIds: [concept.id],
        scopeType: 'chapter',
        scopeId: chapter.id,
        misconceptionTag: 'chapter-coverage',
        questionType: 'mcq',
      }

      questions.push(generatedQuestion)
      questionIds.add(questionId)
      chapterIds.push(questionId)
    }

    chapterQuestionIds.set(chapter.id, chapterIds)
  }

  const quizIndex = new Map(quizzes.map((quiz, index) => [quiz.id, index]))
  for (const chapter of program.chapters) {
    const chapterQuizId = `quiz.${chapter.id}`
    const allChapterQuestionIds = chapterQuestionIds.get(chapter.id) ?? []
    const existingIndex = quizIndex.get(chapterQuizId)

    if (existingIndex === undefined) {
      quizzes.push({
        id: chapterQuizId,
        scopeType: 'chapter',
        scopeId: chapter.id,
        questionIds: allChapterQuestionIds,
      })
      continue
    }

    quizzes[existingIndex] = {
      ...quizzes[existingIndex],
      questionIds: allChapterQuestionIds,
    }
  }

  return {
    ...program,
    questions,
    quizzes,
  }
}

// Existing MVP data kept as seeded rich profile for Std 9.
const std9PhysicsSubjectId = 'sub.sch.std9.physics'
const std9PhysicsChapterId = 'ch.sub.sch.std9.physics.force-laws'
const std9PhysicsModules: Module[] = [
  { id: 'mod.ch.sub.sch.std9.physics.force-laws.1', name: 'Forces and Motion Basics', chapterId: std9PhysicsChapterId },
  { id: 'mod.ch.sub.sch.std9.physics.force-laws.2', name: "Newton's Laws", chapterId: std9PhysicsChapterId },
  { id: 'mod.ch.sub.sch.std9.physics.force-laws.3', name: 'Momentum and Friction', chapterId: std9PhysicsChapterId },
]

const seedConcepts: Concept[] = [
  {
    id: 'c1',
    name: 'Force',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: 'Forces and Motion Basics',
    description: 'A push or pull acting on an object that can change its state of motion.',
    status: 'weak',
    accuracy: 0.65,
  },
  {
    id: 'c2',
    name: 'Mass',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: 'Forces and Motion Basics',
    description: 'The amount of matter in an object, measured in kilograms.',
    status: 'mastered',
    accuracy: 0.92,
  },
  {
    id: 'c3',
    name: 'Acceleration',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: 'Forces and Motion Basics',
    description: 'The rate of change of velocity with respect to time.',
    status: 'weak',
    accuracy: 0.58,
  },
  {
    id: 'c4',
    name: 'Velocity',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: 'Forces and Motion Basics',
    description: 'The speed of an object in a given direction.',
    status: 'mastered',
    accuracy: 0.88,
  },
  {
    id: 'c5',
    name: 'Inertia',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: "Newton's Laws",
    description: 'The tendency of an object to resist changes in its state of motion.',
    status: 'missing',
    accuracy: 0.32,
  },
  {
    id: 'c6',
    name: "Newton's First Law",
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: "Newton's Laws",
    description: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.',
    status: 'missing',
    accuracy: 0.28,
  },
  {
    id: 'c7',
    name: "Newton's Second Law",
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: "Newton's Laws",
    description: 'Force equals mass times acceleration (F = ma).',
    status: 'weak',
    accuracy: 0.45,
  },
  {
    id: 'c8',
    name: "Newton's Third Law",
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: "Newton's Laws",
    description: 'For every action, there is an equal and opposite reaction.',
    status: 'mastered',
    accuracy: 0.85,
  },
  {
    id: 'c9',
    name: 'Momentum',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: 'Momentum and Friction',
    description: 'The product of mass and velocity of an object.',
    status: 'weak',
    accuracy: 0.55,
  },
  {
    id: 'c10',
    name: 'Friction',
    subject: 'Physics',
    chapter: 'Force & Laws of Motion',
    module: 'Momentum and Friction',
    description: 'A force that opposes the relative motion of two surfaces in contact.',
    status: 'mastered',
    accuracy: 0.78,
  },
]

const seedConceptDependencies: ConceptDependency[] = [
  { id: 'd1', parentConceptId: 'c4', childConceptId: 'c3' },
  { id: 'd2', parentConceptId: 'c2', childConceptId: 'c1' },
  { id: 'd3', parentConceptId: 'c3', childConceptId: 'c1' },
  { id: 'd4', parentConceptId: 'c2', childConceptId: 'c5' },
  { id: 'd5', parentConceptId: 'c5', childConceptId: 'c6' },
  { id: 'd6', parentConceptId: 'c1', childConceptId: 'c6' },
  { id: 'd7', parentConceptId: 'c1', childConceptId: 'c7' },
  { id: 'd8', parentConceptId: 'c2', childConceptId: 'c7' },
  { id: 'd9', parentConceptId: 'c3', childConceptId: 'c7' },
  { id: 'd10', parentConceptId: 'c1', childConceptId: 'c8' },
  { id: 'd11', parentConceptId: 'c2', childConceptId: 'c9' },
  { id: 'd12', parentConceptId: 'c4', childConceptId: 'c9' },
  { id: 'd13', parentConceptId: 'c1', childConceptId: 'c10' },
]

const seedQuestions: Question[] = [
  {
    id: 'q1',
    questionText: 'What is the SI unit of force?',
    options: ['Joule', 'Newton', 'Pascal', 'Watt'],
    correctAnswer: 'Newton',
    difficulty: 'easy',
    explanation: 'The SI unit of force is Newton (N), named after Sir Isaac Newton.',
    conceptIds: ['c1'],
    scopeType: 'concept',
    scopeId: 'c1',
    misconceptionTag: 'unit-confusion',
    questionType: 'mcq',
  },
  {
    id: 'q2',
    questionText: "According to Newton's Second Law, what happens to acceleration if force doubles and mass stays constant?",
    options: ['Acceleration halves', 'Acceleration doubles', 'Acceleration remains same', 'Acceleration quadruples'],
    correctAnswer: 'Acceleration doubles',
    difficulty: 'medium',
    explanation: 'F = ma means a = F/m. If F doubles with constant m, acceleration doubles.',
    conceptIds: ['c7', 'c1', 'c3'],
    scopeType: 'module',
    scopeId: std9PhysicsModules[1].id,
    misconceptionTag: 'formula-misapplication',
    questionType: 'mcq',
  },
  {
    id: 'q3',
    questionText: 'A body of mass 5 kg is acted upon by a force of 10 N. What is its acceleration?',
    options: ['0.5 m/s²', '2 m/s²', '15 m/s²', '50 m/s²'],
    correctAnswer: '2 m/s²',
    difficulty: 'medium',
    explanation: 'Using F = ma, a = 10/5 = 2 m/s².',
    conceptIds: ['c7', 'c1', 'c2', 'c3'],
    scopeType: 'chapter',
    scopeId: std9PhysicsChapterId,
    misconceptionTag: 'formula-misapplication',
    questionType: 'mcq',
  },
  {
    id: 'q4',
    questionText: 'What is inertia?',
    options: [
      'The tendency of an object to resist changes in motion',
      'The force that causes motion',
      'The speed of an object',
      'The energy stored in an object',
    ],
    correctAnswer: 'The tendency of an object to resist changes in motion',
    difficulty: 'easy',
    explanation: 'Inertia is the tendency of an object to resist any change in its state of motion.',
    conceptIds: ['c5'],
    scopeType: 'concept',
    scopeId: 'c5',
    misconceptionTag: 'definition-confusion',
    questionType: 'mcq',
  },
  {
    id: 'q5',
    questionText: 'When a bus suddenly stops, passengers fall forward. This is due to:',
    options: ['Friction', 'Inertia of motion', 'Gravity', 'Momentum conservation'],
    correctAnswer: 'Inertia of motion',
    difficulty: 'medium',
    explanation: 'Passengers tend to continue forward due to inertia of motion.',
    conceptIds: ['c5', 'c6'],
    scopeType: 'module',
    scopeId: std9PhysicsModules[1].id,
    misconceptionTag: 'law-application',
    questionType: 'mcq',
  },
  {
    id: 'q6',
    questionText: 'Calculate the momentum of a 2 kg object moving at 5 m/s.',
    options: ['2.5 kg·m/s', '7 kg·m/s', '10 kg·m/s', '0.4 kg·m/s'],
    correctAnswer: '10 kg·m/s',
    difficulty: 'easy',
    explanation: 'Momentum = mass × velocity = 2 × 5 = 10 kg·m/s.',
    conceptIds: ['c9', 'c2', 'c4'],
    scopeType: 'module',
    scopeId: std9PhysicsModules[2].id,
    misconceptionTag: 'formula-misapplication',
    questionType: 'mcq',
  },
  {
    id: 'q7',
    questionText: "Which Newton's law explains why rockets work in space?",
    options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
    correctAnswer: 'Third Law',
    difficulty: 'medium',
    explanation: 'Action-reaction principle explains rocket propulsion.',
    conceptIds: ['c8'],
    scopeType: 'concept',
    scopeId: 'c8',
    misconceptionTag: 'law-identification',
    questionType: 'mcq',
  },
  {
    id: 'q8',
    questionText: 'What is the relationship between acceleration and velocity?',
    options: [
      'Acceleration is the rate of change of velocity',
      'Velocity is the rate of change of acceleration',
      'They are the same thing',
      'They are inversely proportional',
    ],
    correctAnswer: 'Acceleration is the rate of change of velocity',
    difficulty: 'easy',
    explanation: 'Acceleration measures how quickly velocity changes with time.',
    conceptIds: ['c3', 'c4'],
    scopeType: 'module',
    scopeId: std9PhysicsModules[0].id,
    misconceptionTag: 'definition-confusion',
    questionType: 'mcq',
  },
]

const seedQuizzes: Quiz[] = [
  {
    id: 'quiz.ch.sub.sch.std9.physics.force-laws',
    scopeType: 'chapter',
    scopeId: std9PhysicsChapterId,
    questionIds: seedQuestions.map((question) => question.id),
  },
]

const std10PhysicsSubjectId = 'sub.sch.std10.physics'
const std10PhysicsChapterId = 'ch.sub.sch.std10.physics.electricity'
const std10PhysicsModules: Module[] = [
  { id: 'mod.ch.sub.sch.std10.physics.electricity.1', name: 'Current and Charge', chapterId: std10PhysicsChapterId },
  { id: 'mod.ch.sub.sch.std10.physics.electricity.2', name: "Ohm's Law and Resistance", chapterId: std10PhysicsChapterId },
  { id: 'mod.ch.sub.sch.std10.physics.electricity.3', name: 'Power and Household Circuits', chapterId: std10PhysicsChapterId },
]

const std10Concepts: Concept[] = [
  { id: 'std10c1', name: 'Electric Current', subject: 'Physics', chapter: 'Electricity', module: 'Current and Charge', description: 'Flow of electric charge per unit time.', status: 'weak', accuracy: 0.62 },
  { id: 'std10c2', name: 'Electric Charge', subject: 'Physics', chapter: 'Electricity', module: 'Current and Charge', description: 'Fundamental property that causes electric effects.', status: 'mastered', accuracy: 0.83 },
  { id: 'std10c3', name: "Ohm's Law", subject: 'Physics', chapter: 'Electricity', module: "Ohm's Law and Resistance", description: 'Current through a conductor is proportional to potential difference.', status: 'weak', accuracy: 0.57 },
  { id: 'std10c4', name: 'Resistance', subject: 'Physics', chapter: 'Electricity', module: "Ohm's Law and Resistance", description: 'Opposition offered by a conductor to the flow of current.', status: 'missing', accuracy: 0.41 },
  { id: 'std10c5', name: 'Electric Power', subject: 'Physics', chapter: 'Electricity', module: 'Power and Household Circuits', description: 'Rate at which electric energy is consumed.', status: 'weak', accuracy: 0.53 },
  { id: 'std10c6', name: 'Series and Parallel Circuits', subject: 'Physics', chapter: 'Electricity', module: 'Power and Household Circuits', description: 'Two common ways of connecting electrical components.', status: 'missing', accuracy: 0.36 },
]

const std10Dependencies: ConceptDependency[] = [
  { id: 'std10d1', parentConceptId: 'std10c2', childConceptId: 'std10c1' },
  { id: 'std10d2', parentConceptId: 'std10c1', childConceptId: 'std10c3' },
  { id: 'std10d3', parentConceptId: 'std10c3', childConceptId: 'std10c4' },
  { id: 'std10d4', parentConceptId: 'std10c4', childConceptId: 'std10c6' },
  { id: 'std10d5', parentConceptId: 'std10c1', childConceptId: 'std10c5' },
  { id: 'std10d6', parentConceptId: 'std10c6', childConceptId: 'std10c5' },
]

const std10Questions: Question[] = [
  { id: 'std10q1', questionText: 'What is electric current?', options: ['Charge per unit voltage', 'Flow of charge per unit time', 'Force on charge', 'Energy per unit time'], correctAnswer: 'Flow of charge per unit time', difficulty: 'easy', explanation: 'Current is defined as charge flowing per second.', conceptIds: ['std10c1'], scopeType: 'concept', scopeId: 'std10c1', misconceptionTag: 'definition-confusion', questionType: 'mcq' },
  { id: 'std10q2', questionText: "State Ohm's law.", options: ['V is inversely proportional to I', 'I is directly proportional to V at constant temperature', 'R is proportional to I', 'Power is proportional to V'], correctAnswer: 'I is directly proportional to V at constant temperature', difficulty: 'easy', explanation: "Ohm's law states V = IR under constant physical conditions.", conceptIds: ['std10c3'], scopeType: 'concept', scopeId: 'std10c3', misconceptionTag: 'law-definition', questionType: 'mcq' },
  { id: 'std10q3', questionText: 'Unit of resistance is:', options: ['Volt', 'Ohm', 'Watt', 'Ampere'], correctAnswer: 'Ohm', difficulty: 'easy', explanation: 'Resistance is measured in ohms.', conceptIds: ['std10c4'], scopeType: 'module', scopeId: std10PhysicsModules[1].id, misconceptionTag: 'unit-confusion', questionType: 'mcq' },
  { id: 'std10q4', questionText: 'Which circuit is used in household wiring?', options: ['Series', 'Parallel', 'Mixed only', 'None'], correctAnswer: 'Parallel', difficulty: 'medium', explanation: 'Parallel connection allows appliances to work independently.', conceptIds: ['std10c6'], scopeType: 'module', scopeId: std10PhysicsModules[2].id, misconceptionTag: 'application-error', questionType: 'mcq' },
  { id: 'std10q5', questionText: 'Electrical power is given by:', options: ['P = VI', 'P = IR', 'P = V/R', 'P = I/R'], correctAnswer: 'P = VI', difficulty: 'medium', explanation: 'Power consumed in a circuit is product of voltage and current.', conceptIds: ['std10c5'], scopeType: 'module', scopeId: std10PhysicsModules[2].id, misconceptionTag: 'formula-misapplication', questionType: 'mcq' },
  { id: 'std10q6', questionText: 'If V = 12V and I = 2A, resistance is:', options: ['6 ohm', '24 ohm', '10 ohm', '0.16 ohm'], correctAnswer: '6 ohm', difficulty: 'medium', explanation: 'R = V/I = 12/2 = 6 ohm.', conceptIds: ['std10c3', 'std10c4'], scopeType: 'chapter', scopeId: std10PhysicsChapterId, misconceptionTag: 'formula-misapplication', questionType: 'mcq' },
]

const std10Quizzes: Quiz[] = [
  { id: 'quiz.ch.sub.sch.std10.physics.electricity', scopeType: 'chapter', scopeId: std10PhysicsChapterId, questionIds: std10Questions.map((question) => question.id) },
]

const cseSem1PfSubjectId = 'sub.bt.cse.sem1.programming-fundamentals'
const cseSem1PfChapterId = 'ch.sub.bt.cse.sem1.programming-fundamentals.computation-basics'
const cseSem1PfModules: Module[] = [
  { id: 'mod.ch.sub.bt.cse.sem1.pf.1', name: 'Problem Solving and Algorithms', chapterId: cseSem1PfChapterId },
  { id: 'mod.ch.sub.bt.cse.sem1.pf.2', name: 'C Programming Basics', chapterId: cseSem1PfChapterId },
  { id: 'mod.ch.sub.bt.cse.sem1.pf.3', name: 'Control Flow and Functions', chapterId: cseSem1PfChapterId },
]

const cseSem1Concepts: Concept[] = [
  { id: 'cse1c1', name: 'Algorithm', subject: 'Programming Fundamentals', chapter: 'Computation Basics', module: 'Problem Solving and Algorithms', description: 'Finite sequence of steps to solve a problem.', status: 'weak', accuracy: 0.6 },
  { id: 'cse1c2', name: 'Flowchart', subject: 'Programming Fundamentals', chapter: 'Computation Basics', module: 'Problem Solving and Algorithms', description: 'Graphical representation of algorithmic steps.', status: 'mastered', accuracy: 0.82 },
  { id: 'cse1c3', name: 'Variables and Data Types', subject: 'Programming Fundamentals', chapter: 'Computation Basics', module: 'C Programming Basics', description: 'Storage units and data categories used in C.', status: 'weak', accuracy: 0.58 },
  { id: 'cse1c4', name: 'Operators', subject: 'Programming Fundamentals', chapter: 'Computation Basics', module: 'C Programming Basics', description: 'Symbols that perform operations on operands.', status: 'missing', accuracy: 0.43 },
  { id: 'cse1c5', name: 'Conditional Statements', subject: 'Programming Fundamentals', chapter: 'Computation Basics', module: 'Control Flow and Functions', description: 'Decision-making statements such as if/else and switch.', status: 'weak', accuracy: 0.55 },
  { id: 'cse1c6', name: 'Functions', subject: 'Programming Fundamentals', chapter: 'Computation Basics', module: 'Control Flow and Functions', description: 'Reusable blocks of code for modular programming.', status: 'missing', accuracy: 0.39 },
]

const cseSem1Dependencies: ConceptDependency[] = [
  { id: 'cse1d1', parentConceptId: 'cse1c1', childConceptId: 'cse1c2' },
  { id: 'cse1d2', parentConceptId: 'cse1c1', childConceptId: 'cse1c3' },
  { id: 'cse1d3', parentConceptId: 'cse1c3', childConceptId: 'cse1c4' },
  { id: 'cse1d4', parentConceptId: 'cse1c4', childConceptId: 'cse1c5' },
  { id: 'cse1d5', parentConceptId: 'cse1c5', childConceptId: 'cse1c6' },
]

const cseSem1Questions: Question[] = [
  { id: 'cse1q1', questionText: 'An algorithm must be:', options: ['Ambiguous', 'Finite and unambiguous', 'Always recursive', 'Only graphical'], correctAnswer: 'Finite and unambiguous', difficulty: 'easy', explanation: 'Algorithms should have clear, finite steps.', conceptIds: ['cse1c1'], scopeType: 'concept', scopeId: 'cse1c1', misconceptionTag: 'definition-confusion', questionType: 'mcq' },
  { id: 'cse1q2', questionText: 'Which is not a basic C data type?', options: ['int', 'float', 'string', 'char'], correctAnswer: 'string', difficulty: 'easy', explanation: 'C does not provide built-in string type as primitive.', conceptIds: ['cse1c3'], scopeType: 'module', scopeId: cseSem1PfModules[1].id, misconceptionTag: 'type-confusion', questionType: 'mcq' },
  { id: 'cse1q3', questionText: 'Operator used for equality comparison in C:', options: ['=', '==', '!=', '<>'], correctAnswer: '==', difficulty: 'easy', explanation: '= assigns while == compares equality.', conceptIds: ['cse1c4'], scopeType: 'module', scopeId: cseSem1PfModules[1].id, misconceptionTag: 'syntax-confusion', questionType: 'mcq' },
  { id: 'cse1q4', questionText: 'Which statement supports multiple-way branching?', options: ['if', 'if-else', 'switch', 'for'], correctAnswer: 'switch', difficulty: 'medium', explanation: 'switch is used for multi-way selection.', conceptIds: ['cse1c5'], scopeType: 'module', scopeId: cseSem1PfModules[2].id, misconceptionTag: 'control-flow-confusion', questionType: 'mcq' },
  { id: 'cse1q5', questionText: 'Main benefit of functions is:', options: ['Increase file size', 'Code reuse and modularity', 'Avoid variables', 'Remove loops'], correctAnswer: 'Code reuse and modularity', difficulty: 'easy', explanation: 'Functions enable reusable and manageable code.', conceptIds: ['cse1c6'], scopeType: 'concept', scopeId: 'cse1c6', misconceptionTag: 'conceptual-gap', questionType: 'mcq' },
  { id: 'cse1q6', questionText: 'Flowchart symbol for decision is:', options: ['Rectangle', 'Diamond', 'Oval', 'Parallelogram'], correctAnswer: 'Diamond', difficulty: 'easy', explanation: 'Diamond denotes decision branch in flowchart.', conceptIds: ['cse1c2'], scopeType: 'chapter', scopeId: cseSem1PfChapterId, misconceptionTag: 'symbol-confusion', questionType: 'mcq' },
]

const cseSem1Quizzes: Quiz[] = [
  { id: 'quiz.ch.sub.bt.cse.sem1.pf', scopeType: 'chapter', scopeId: cseSem1PfChapterId, questionIds: cseSem1Questions.map((question) => question.id) },
]

function enrichStd9Program(baseProgram: ProgramCatalogEntry): ProgramCatalogEntry {
  const physicsSubject: Subject = {
    id: std9PhysicsSubjectId,
    name: 'Physics',
    profileId: baseProgram.profile.id,
  }
  const replacedSubject = baseProgram.subjects.find((subject) =>
    subject.name === 'Physics' || subject.name === 'Science',
  )

  const chapter: Chapter = {
    id: std9PhysicsChapterId,
    name: 'Force & Laws of Motion',
    subjectId: physicsSubject.id,
  }

  const subjects = [
    physicsSubject,
    ...baseProgram.subjects.filter((subject) => subject.id !== replacedSubject?.id && subject.name !== 'Physics'),
  ]

  const removedPhysicsChapterIds = new Set(
    baseProgram.chapters
      .filter((existingChapter) => existingChapter.subjectId === replacedSubject?.id || existingChapter.subjectId === physicsSubject.id)
      .map((existingChapter) => existingChapter.id),
  )

  const chapters = [
    chapter,
    ...baseProgram.chapters.filter((existingChapter) => !removedPhysicsChapterIds.has(existingChapter.id)),
  ]

  const modules = [
    ...std9PhysicsModules,
    ...baseProgram.modules.filter((module) => !removedPhysicsChapterIds.has(module.chapterId)),
  ]
  const chapterIds = new Set(chapters.map((existingChapter) => existingChapter.id))
  const moduleIds = new Set(modules.map((module) => module.id))
  const conceptIds = new Set([...seedConcepts, ...baseProgram.concepts].map((concept) => concept.id))
  const filteredBaseQuizzes = baseProgram.quizzes.filter((quiz) => {
    if (quiz.scopeType === 'chapter') return chapterIds.has(quiz.scopeId)
    if (quiz.scopeType === 'module') return moduleIds.has(quiz.scopeId)
    if (quiz.scopeType === 'concept') return conceptIds.has(quiz.scopeId)
    return true
  })

  return {
    ...baseProgram,
    subjects,
    chapters,
    modules,
    concepts: [...seedConcepts, ...baseProgram.concepts],
    conceptDependencies: [...seedConceptDependencies, ...baseProgram.conceptDependencies],
    questions: [...seedQuestions, ...baseProgram.questions],
    quizzes: [...seedQuizzes, ...filteredBaseQuizzes],
  }
}

function enrichStd10Program(baseProgram: ProgramCatalogEntry): ProgramCatalogEntry {
  const physicsSubject: Subject = { id: std10PhysicsSubjectId, name: 'Physics', profileId: baseProgram.profile.id }
  const replacedSubject = baseProgram.subjects.find((subject) =>
    subject.name === 'Physics' || subject.name === 'Science',
  )
  const chapter: Chapter = { id: std10PhysicsChapterId, name: 'Electricity', subjectId: physicsSubject.id }

  const removedPhysicsChapters = baseProgram.chapters.filter(
    (existingChapter) => existingChapter.subjectId === replacedSubject?.id || existingChapter.subjectId === physicsSubject.id,
  )
  const removedPhysicsChapterIds = new Set(removedPhysicsChapters.map((existingChapter) => existingChapter.id))
  const removedPhysicsChapterNames = new Set(removedPhysicsChapters.map((existingChapter) => existingChapter.name))

  const additionalPhysicsChapters: Chapter[] = removedPhysicsChapters
    .filter((existingChapter) => existingChapter.name !== chapter.name)
    .map((existingChapter, index) => ({
      id: `ch.${physicsSubject.id}.auto.${index + 1}`,
      name: existingChapter.name,
      subjectId: physicsSubject.id,
    }))
  const additionalPhysicsModules: Module[] = additionalPhysicsChapters.flatMap((physicsChapter) =>
    buildSchoolModules(physicsSubject.name, physicsChapter.name).map((moduleName, moduleIndex) => ({
      id: `mod.${physicsChapter.id}.${moduleIndex + 1}`,
      name: moduleName,
      chapterId: physicsChapter.id,
    })),
  )
  const additionalPhysicsGenerated = buildGeneratedLearningArtifacts(
    [physicsSubject],
    additionalPhysicsChapters,
    additionalPhysicsModules,
  )

  const removedPhysicsModuleIds = new Set(
    baseProgram.modules
      .filter((module) => removedPhysicsChapterIds.has(module.chapterId))
      .map((module) => module.id),
  )
  const removedPhysicsConceptIds = new Set(
    baseProgram.concepts
      .filter((concept) => (concept.subject === replacedSubject?.name || concept.subject === physicsSubject.name) && removedPhysicsChapterNames.has(concept.chapter))
      .map((concept) => concept.id),
  )

  const subjects = [
    physicsSubject,
    ...baseProgram.subjects.filter((subject) => subject.id !== replacedSubject?.id && subject.name !== 'Physics'),
  ]

  const chapters = [
    chapter,
    ...additionalPhysicsChapters,
    ...baseProgram.chapters.filter((existingChapter) => !removedPhysicsChapterIds.has(existingChapter.id)),
  ]
  const modules = [
    ...std10PhysicsModules,
    ...additionalPhysicsModules,
    ...baseProgram.modules.filter((module) => !removedPhysicsChapterIds.has(module.chapterId)),
  ]
  const concepts = [
    ...std10Concepts,
    ...additionalPhysicsGenerated.concepts,
    ...baseProgram.concepts.filter((concept) => !removedPhysicsConceptIds.has(concept.id)),
  ]
  const conceptDependencies = [
    ...std10Dependencies,
    ...additionalPhysicsGenerated.conceptDependencies,
    ...baseProgram.conceptDependencies.filter(
      (dependency) => !removedPhysicsConceptIds.has(dependency.parentConceptId) && !removedPhysicsConceptIds.has(dependency.childConceptId),
    ),
  ]
  const questions = [
    ...std10Questions,
    ...additionalPhysicsGenerated.questions,
    ...baseProgram.questions.filter((question) => !question.conceptIds.some((conceptId) => removedPhysicsConceptIds.has(conceptId))),
  ]
  const chapterIds = new Set(chapters.map((existingChapter) => existingChapter.id))
  const moduleIds = new Set(modules.map((module) => module.id))
  const conceptIds = new Set(concepts.map((concept) => concept.id))
  const questionIds = new Set(questions.map((question) => question.id))
  const filteredBaseQuizzes = baseProgram.quizzes.filter((quiz) => {
    if (quiz.scopeType === 'chapter') return chapterIds.has(quiz.scopeId)
    if (quiz.scopeType === 'module') return moduleIds.has(quiz.scopeId)
    if (quiz.scopeType === 'concept') return conceptIds.has(quiz.scopeId)
    return quiz.questionIds.some((questionId) => questionIds.has(questionId))
  })

  return {
    ...baseProgram,
    subjects,
    chapters,
    modules,
    concepts,
    conceptDependencies,
    questions,
    quizzes: [...std10Quizzes, ...additionalPhysicsGenerated.quizzes, ...filteredBaseQuizzes],
  }
}

function enrichBtechCseSem1Program(baseProgram: ProgramCatalogEntry): ProgramCatalogEntry {
  const pfSubject: Subject = { id: cseSem1PfSubjectId, name: 'Programming Fundamentals', profileId: baseProgram.profile.id }
  const replacedSubject = baseProgram.subjects.find((subject) =>
    subject.name === 'Programming Fundamentals' || subject.name === 'Programming for Problem Solving',
  )
  const chapter: Chapter = { id: cseSem1PfChapterId, name: 'Computation Basics', subjectId: pfSubject.id }

  const subjects = [
    pfSubject,
    ...baseProgram.subjects.filter((subject) => subject.id !== replacedSubject?.id && subject.name !== 'Programming Fundamentals'),
  ]
  const removedPfChapterIds = new Set(
    baseProgram.chapters
      .filter((existingChapter) => existingChapter.subjectId === replacedSubject?.id || existingChapter.subjectId === pfSubject.id)
      .map((existingChapter) => existingChapter.id),
  )
  const chapters = [chapter, ...baseProgram.chapters.filter((existingChapter) => !removedPfChapterIds.has(existingChapter.id))]
  const modules = [...cseSem1PfModules, ...baseProgram.modules.filter((module) => !removedPfChapterIds.has(module.chapterId))]
  const chapterIds = new Set(chapters.map((existingChapter) => existingChapter.id))
  const moduleIds = new Set(modules.map((module) => module.id))
  const conceptIds = new Set([...cseSem1Concepts, ...baseProgram.concepts].map((concept) => concept.id))
  const filteredBaseQuizzes = baseProgram.quizzes.filter((quiz) => {
    if (quiz.scopeType === 'chapter') return chapterIds.has(quiz.scopeId)
    if (quiz.scopeType === 'module') return moduleIds.has(quiz.scopeId)
    if (quiz.scopeType === 'concept') return conceptIds.has(quiz.scopeId)
    return true
  })

  return {
    ...baseProgram,
    subjects,
    chapters,
    modules,
    concepts: [...cseSem1Concepts, ...baseProgram.concepts],
    conceptDependencies: [...cseSem1Dependencies, ...baseProgram.conceptDependencies],
    questions: [...cseSem1Questions, ...baseProgram.questions],
    quizzes: [...cseSem1Quizzes, ...filteredBaseQuizzes],
  }
}

const programs: ProgramCatalogEntry[] = learnerProfiles.map((profile) => {
  const seededProgram = buildProgramSeed(profile)
  let program = seededProgram
  if (profile.id === SCHOOL_STD9_PROFILE_ID) {
    program = enrichStd9Program(seededProgram)
  }
  if (profile.id === SCHOOL_STD10_PROFILE_ID) {
    program = enrichStd10Program(seededProgram)
  }
  if (profile.id === BTECH_CSE_SEM1_PROFILE_ID) {
    program = enrichBtechCseSem1Program(seededProgram)
  }
  return ensureMinimumChapterQuestionCoverage(program, 40)
})

function getProgram(profileId: string = defaultProfileId): ProgramCatalogEntry {
  return programs.find((program) => program.profile.id === profileId) ?? programs[0]
}

// Backward-compatible exports used by current pages.
export const concepts = getProgram().concepts
export const conceptDependencies = getProgram().conceptDependencies
export const questions = getProgram().questions

export function getAvailableProfiles(): LearnerProfile[] {
  return learnerProfiles
}

export function getActiveProgram(profileId: string = defaultProfileId): ProgramCatalogEntry {
  return getProgram(profileId)
}

export function getSubjects(profileId: string = defaultProfileId): Subject[] {
  return getProgram(profileId).subjects
}

export function getChapters(profileId: string = defaultProfileId): Chapter[] {
  return getProgram(profileId).chapters
}

export function getModules(profileId: string = defaultProfileId): Module[] {
  return getProgram(profileId).modules
}

export function getConcepts(profileId: string = defaultProfileId): Concept[] {
  return getProgram(profileId).concepts
}

export function getConceptDependencies(profileId: string = defaultProfileId): ConceptDependency[] {
  return getProgram(profileId).conceptDependencies
}

export function getQuestions(profileId: string = defaultProfileId): Question[] {
  const program = getProgram(profileId)
  const conceptById = new Map(program.concepts.map((concept) => [concept.id, concept]))
  const fallbackSubject = 'General'
  const groupedBySubject = new Map<string, Question[]>()

  for (const question of program.questions) {
    const firstConceptId = question.conceptIds[0]
    const subject = firstConceptId ? conceptById.get(firstConceptId)?.subject ?? fallbackSubject : fallbackSubject
    const bucket = groupedBySubject.get(subject) ?? []
    bucket.push(question)
    groupedBySubject.set(subject, bucket)
  }

  const subjects = [...groupedBySubject.keys()]
  const interleaved: Question[] = []
  let added = true
  while (added) {
    added = false
    for (const subject of subjects) {
      const bucket = groupedBySubject.get(subject)
      if (bucket && bucket.length > 0) {
        interleaved.push(bucket.shift() as Question)
        added = true
      }
    }
  }

  return interleaved
}

export const userProgress: UserConceptProgress[] = concepts.map((concept) => ({
  id: `p-${concept.id}`,
  userId: 'user1',
  conceptId: concept.id,
  accuracy: concept.accuracy ?? 0,
  confidenceLevel: (concept.accuracy ?? 0) > 0.7 ? 'high' : (concept.accuracy ?? 0) > 0.4 ? 'medium' : 'low',
  lastUpdated: new Date(),
}))

export function getGraphNodes(profileId: string = defaultProfileId): GraphNode[] {
  const scopedConcepts = getConcepts(profileId)
  const nodePositions: Record<string, { x: number; y: number }> = {
    c4: { x: 100, y: 100 },
    c2: { x: 300, y: 100 },
    c3: { x: 100, y: 250 },
    c1: { x: 300, y: 250 },
    c5: { x: 500, y: 100 },
    c9: { x: 100, y: 400 },
    c6: { x: 300, y: 400 },
    c7: { x: 500, y: 400 },
    c8: { x: 500, y: 250 },
    c10: { x: 700, y: 250 },
  }

  return scopedConcepts.map((concept) => ({
    id: concept.id,
    position: nodePositions[concept.id] ?? { x: 0, y: 0 },
    data: {
      label: concept.name,
      status: concept.status ?? 'missing',
      accuracy: concept.accuracy,
      concept,
    },
  }))
}

export function getGraphEdges(profileId: string = defaultProfileId): GraphEdge[] {
  return getConceptDependencies(profileId).map((dependency) => ({
    id: dependency.id,
    source: dependency.parentConceptId,
    target: dependency.childConceptId,
  }))
}

export function getWeakConcepts(profileId: string = defaultProfileId): Concept[] {
  const weakConcepts = getConcepts(profileId)
    .filter((concept) => concept.status === 'weak' || concept.status === 'missing')
    .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))

  const groupedBySubject = new Map<string, Concept[]>()
  for (const concept of weakConcepts) {
    const bucket = groupedBySubject.get(concept.subject) ?? []
    bucket.push(concept)
    groupedBySubject.set(concept.subject, bucket)
  }

  const subjectKeys = [...groupedBySubject.keys()]
  const diversified: Concept[] = []
  let progressed = true
  while (progressed) {
    progressed = false
    for (const key of subjectKeys) {
      const bucket = groupedBySubject.get(key)
      if (bucket && bucket.length > 0) {
        diversified.push(bucket.shift() as Concept)
        progressed = true
      }
    }
  }
  return diversified
}

export function getSuggestedConcept(profileId: string = defaultProfileId): Concept | null {
  const weakConcepts = getWeakConcepts(profileId)
  if (weakConcepts.length === 0) return null
  return [...weakConcepts].sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0]
}

export function diagnoseError(
  questionId: string,
  profileId: string = defaultProfileId,
): { missingConcept: Concept; chain: Concept[]; suggestion: string } | null {
  const scopedQuestions = getQuestions(profileId)
  const scopedConcepts = getConcepts(profileId)
  const scopedDependencies = getConceptDependencies(profileId)

  const question = scopedQuestions.find((item) => item.id === questionId)
  if (!question) return null

  const relatedConcepts = question.conceptIds
    .map((conceptId) => scopedConcepts.find((concept) => concept.id === conceptId))
    .filter((concept): concept is Concept => concept !== undefined)

  const weakestConcept =
    relatedConcepts.find((concept) => concept.status === 'missing' || concept.status === 'weak') ??
    relatedConcepts[0]
  if (!weakestConcept) return null

  const chain = scopedDependencies
    .filter((dependency) => dependency.childConceptId === weakestConcept.id)
    .map((dependency) => scopedConcepts.find((concept) => concept.id === dependency.parentConceptId))
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

export function getProgressStats(profileId: string = defaultProfileId) {
  const scopedConcepts = getConcepts(profileId)
  const total = scopedConcepts.length
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

  const mastered = scopedConcepts.filter((concept) => concept.status === 'mastered').length
  const weak = scopedConcepts.filter((concept) => concept.status === 'weak').length
  const missing = scopedConcepts.filter((concept) => concept.status === 'missing').length
  const avgAccuracy = scopedConcepts.reduce((sum, concept) => sum + (concept.accuracy ?? 0), 0) / total

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

function statusFromAccuracy(accuracy: number): Concept['status'] {
  if (accuracy >= 0.8) return 'mastered'
  if (accuracy >= 0.5) return 'weak'
  return 'missing'
}

export function getMasteryStates(profileId: string = defaultProfileId): MasteryState[] {
  return getConcepts(profileId).map((concept) => {
    const accuracy = concept.accuracy ?? 0
    const status = statusFromAccuracy(accuracy)
    return {
      conceptId: concept.id,
      accuracy,
      status,
      confidenceLevel: accuracy >= 0.8 ? 'high' : accuracy >= 0.5 ? 'medium' : 'low',
      attempts: 10,
    }
  })
}

export function getAdaptiveRecommendation(profileId: string = defaultProfileId): AdaptiveRecommendation | null {
  const program = getProgram(profileId)
  if (program.concepts.length === 0) return null

  const conceptMap = new Map(program.concepts.map((concept) => [concept.id, concept]))

  const missingPrerequisite = program.conceptDependencies
    .map((dependency) => conceptMap.get(dependency.parentConceptId))
    .find((concept) => concept && statusFromAccuracy(concept.accuracy ?? 0) === 'missing')
  if (missingPrerequisite) {
    return { concept: missingPrerequisite, reason: 'missing-prerequisite' }
  }

  const weakConcept = program.concepts
    .filter((concept) => statusFromAccuracy(concept.accuracy ?? 0) === 'weak')
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0]
  if (weakConcept) {
    return { concept: weakConcept, reason: 'weak-concept' }
  }

  const nextUnlocked = program.concepts.find((concept) => statusFromAccuracy(concept.accuracy ?? 0) !== 'mastered')
  if (nextUnlocked) {
    return { concept: nextUnlocked, reason: 'next-unlocked' }
  }

  return null
}
