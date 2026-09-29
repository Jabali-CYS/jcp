import { AcademyInfo, OperationalTarget, TrainingPackage, AcademyUnit, TimelinePhase, TrainingProgram } from './models';

export const academyInfo: AcademyInfo = {
  id: 'academy-1',
  sourceStatus: 'SOURCE_VERIFIED',
  aboutAcademy: 'تُعتبر هذه الأكاديمية ذراعًا معرفيًّا وتنظيميًّا داخليًّا للحزب، ويُطبَّق عليها مبدأ الاستقلال الإداري والتشغيلي في حدود ما يُقرّه الحزب والمكتب السياسي.',
  aboutAcademyEn: 'This academy is considered an internal cognitive and organizational arm of the party. It operates on the principle of administrative and operational independence within the limits approved by the party and the political bureau.',
  vision: 'تطوير العمل الحزبي الوطني برؤية وطنية صادقة تحقق الإنجاز، وبوسائل سلمية تحفظ وحدة الشعب والسلم الأهلي، وتــرســيخ الــعمل الحــزبــي؛ لــيكون نــواة انطلاق نــحو المشاركة الــسياســية الــفاعــلة بهــدف الـوصـول إلـى أغـلبية بـرلمانية بـرامـجية؛ لـتشكيل حـكومـة حزبية قـادرة عـلى تـنفيذ بـرامـج الحـــزب وتـــطلعاتـــه بـــموجـــب آلـــيات عـــمل واضـــحة، وجـــداول زمـــنية محـــددة وفـــقاً لأحكام الـدسـتور، وتـرسـيخ المشاركة الـفاعـلة فـي كـافـة أوجـه الـحياة الـسياسـيّة، والاجتماعية، والاقتصادية، والثقافية.',
  visionEn: 'Developing national partisan work with a sincere national vision that achieves accomplishment, through peaceful means that preserve the unity of the people and civil peace...',
  mission: 'حزب المحافظين هو حزب أردني النشأة لكل أبناء الوطن المؤمنين بثوابته وسيادته وكيانه، ويملك تصوراً واضحَ المعالم والملامح لكل التحديات والقضايا الوطنية العالقة والمُلحّة.',
  missionEn: 'The Conservative Party is an organically Jordanian party for all citizens who believe in the nation\'s principles, sovereignty, and entity. It possesses a clear vision and framework for all pending and urgent national challenges and issues.',
  principles: [
    'الهويّة الوطنية الأردنيّة ثابت من ثوابت الحزب.',
    'الحفاظ على الوحدة الوطنيّة واجب مقدس.',
    'الشفافيّة والعدالة منهج عمل.',
    'التعددية السياسية والفكرية والحزبية نهج وضرورة، وثابت من ثوابت العمل الوطني، قائم على قبول الآخر والتسامح والاعتدال.',
    'الاستدامة البيئية ومعالجة تحديات المناخ.',
    'التوازن بين الحقوق والوجبات وفق مقتضيات الوطنية والمواطنة، وتكريس مبادئ العدالة والمساواة وتكافؤ الفرص بين الأردنيين.',
    'سيادة القانون والنزاهة والشفافية والحوكمة نهج عمل.',
    'القوات المسلحة والأجهزة الأمنية درع الوطن وعينه الساهرة، والضامن الأساسي لأمن الوطن وتعزيز سيادته الوطنية.',
    'الاقتصاد الحرّ نهج ضروري وتدخل الدولة مهم في المنعطفات الفاصلة التي تمس أمن المجتمع واستقرار الدولة.',
    'الجامعات منارات إشعاع وطني، والحريات الأكاديمية نهج ضروري.',
    'الشباب عماد المستقبل وشركاء فاعلين في صنع القرار الوطني.',
    'المرأة نصف المجتمع ومربية النصف الآخر ودورها يعزز الإنتاج والشراكة الوطنية.',
    'فلسطين قضية العرب والمسلمين المركزية، وقيام الدولة الفلسطينية المستقلة ذات السيادة على أرضها وعاصمتها القدس الشريف هو هدف أساسي للأمن القومي الأردني.'
  ],
  principlesEn: [
    'The Jordanian national identity is a constant principle of the party.',
    'Preserving national unity is a sacred duty.',
    'Transparency and justice are a working methodology.',
    'Political, intellectual, and partisan pluralism is an approach and necessity, and a constant of national work, based on accepting the other, tolerance, and moderation.',
    'Environmental sustainability and addressing climate challenges.',
    'Balancing rights and duties according to the requirements of patriotism and citizenship, and consolidating the principles of justice, equality, and equal opportunities among Jordanians.',
    'The rule of law, integrity, transparency, and governance are a working methodology.',
    'The armed forces and security apparatuses are the shield of the homeland and its watchful eye, and the basic guarantor of the homeland\'s security and the strengthening of its national sovereignty.',
    'The free economy is a necessary approach, and state intervention is important at decisive junctures that affect the security of society and the stability of the state.',
    'Universities are beacons of national radiance, and academic freedoms are a necessary approach.',
    'Youth are the pillar of the future and active partners in national decision-making.',
    'Women are half of society and the educators of the other half, and their role enhances production and national partnership.',
    'Palestine is the central issue of Arabs and Muslims, and the establishment of an independent, sovereign Palestinian state on its land with Jerusalem as its capital is a primary goal for Jordanian national security.'
  ],
  goals: [
    'العمل على تطوير العمل في القطاعات الاقتصادية والخدمية من خلال برامج واضحة ورؤية وطنية شاملة في كل المجالات، تعالج القطاعات جميعها بما في ذلك التعامل مع الأزمات المختلفة أو مساعدة القطاعات لعبور المستقبل بما يمثل رافعة للاقتصاد والإنتاج والإبداع والرخاء للمجتمع الأردني.',
    'المساهمة في استثمار مصادر الطاقة التقليدية والمتجددة، والاستثمار في الصخر الزيتي، واستخراج الخامات الطبيعية والمعادن.',
    'تطوير الخدمات الصحية الحكومية والسعي إلى توسيع مظلّة التأمين الصحي الشامل لكل الأردنيين.',
    'العمل على تحديث التشريعات الاقتصادية والسياسية والاجتماعية والثقافية وتعزيز قيم العدالة وتكافؤ الفرص وجذب الاستثمار وتحقيق رخاء العيش بما يستحقه المواطن الأردني.',
    'المساهمة في ترسيخ إعلام الدولة الذي يسهم في بناء المواطن المنتمي لوطنه وأمته المعتز بقيمه الحضارية والوطنية إعلاماً يجذر حرية التعبير المتوازنة بين الواجبات والحقوق، وفق مرتكزات حق الحصول على المعلومة.',
    'تعزيز سيادة القانون والمساواة والعدالة في التطبيق الفاعل للقوانين والتشريعات، واحترامها، والالتزام بتطبيقها لدى الأفراد والمؤسسات بعدالة بعيداً عن المفاضلة أو عن الانتقائية.',
    'مشاركة المؤسسات والهيئات الوطنية في وضع الخطط والبرامج وذلك لتحقيق الفاعلية والإنتاجية لتلك الجهود، وبلورة قوى دافعة في عملية التنمية الاجتماعية والاقتصادية والسياسية من خلال بناء قدرات المجتمع الأردني.',
    'يعمل الحزب على طرح مفهوم الأصالة والمعاصرة كعناوين للتطوير المعاصر في سياق حركة واعية ملتزمة وفق المعايير الوطنية.',
    'يرنو الحزب إلى التغيير في فهم الناس وحماسهم للعمل الحزبي وأهميته في التأطير والتغيير.',
    'يسعى الحزب لأن تكون استراتيجيته ضمن أولويات وطنية حقيقية تغادر مساحات المصالح الضيّقة إلى أفق مصالح الدولة العليا.',
    'يهدف الحزب إلى طرح البدائل لحل المشكلات ضمن إستراتيجية تأخذ بعين الاعتبار الواقع والمتغيرات والإمكانات، والتغيير في السياسات وليس في الأشخاص.',
    'يريد الحزب أن يكون جامعاً لكل الأردنيين المؤمنين بهوية الدولة وسيادتها؛ لأنه ينتمي إلى حرص وإيمان وطني مشترك ووطن تهدده أخطار كبيرة خارجية وداخلية.',
    'يعمل الحزب على تأهيل أعضائه لتعزيز الثوابت الوطنية لديهم.',
    'يسعى الحزب لأن يكون للشباب دورهم الفاعل فيه لأنهم أمل المستقبل وعماد النهضة.'
  ],
  goalsEn: [
    'Working to develop work in the economic and service sectors through clear programs and a comprehensive national vision in all fields, addressing all sectors including dealing with various crises or helping sectors to cross into the future, which represents a lever for the economy, production, creativity, and prosperity for Jordanian society.',
    'Contributing to the investment of traditional and renewable energy sources, investing in oil shale, and extracting natural raw materials and minerals.',
    'Developing government health services and striving to expand the umbrella of comprehensive health insurance for all Jordanians.',
    'Working to modernize economic, political, social, and cultural legislation, enhance the values of justice and equal opportunities, attract investment, and achieve living prosperity as the Jordanian citizen deserves.',
    'Contributing to consolidating state media that contributes to building the citizen belonging to their homeland and nation, proud of their civilized and national values, a media that roots freedom of expression balanced between duties and rights, according to the foundations of the right to access information.',
    'Enhancing the rule of law, equality, and justice in the effective application of laws and legislation, respecting them, and committing to their application among individuals and institutions with justice, away from favoritism or selectivity.',
    'Participating with national institutions and bodies in developing plans and programs to achieve the effectiveness and productivity of those efforts, and crystallizing driving forces in the social, economic, and political development process by building the capacities of the Jordanian society.',
    'The party works to present the concept of authenticity and modernity as titles for contemporary development in the context of a conscious, committed movement according to national standards.',
    'The party aspires to change people\'s understanding and enthusiasm for partisan work and its importance in framing and change.',
    'The party seeks for its strategy to be within real national priorities that leave the spaces of narrow interests to the horizon of the supreme interests of the state.',
    'The party aims to present alternatives to solve problems within a strategy that takes into account reality, variables, and capabilities, and change in policies rather than individuals.',
    'The party wants to be inclusive of all Jordanians who believe in the identity and sovereignty of the state; because it belongs to a shared national concern and belief, and a homeland threatened by great external and internal dangers.',
    'The party works to qualify its members to enhance their national constants.',
    'The party strives for youth to have their active role in it because they are the hope of the future and the pillar of the renaissance.'
  ],
  logoSignificance: 'السنبلة: ترمز إلى الأرض والخير والازدهار. الدائرة: الدائرة التي تحتضن خارطة المملكة الأردنية الهاشمية بألوان العلم الأردني ترمز لهوية الدولة، وحدودها المُصانة، والانتماء للتراب الوطني. اليدين المتعاضدتين: ترمز إلى التماسك والتَّضحية والفداء للوطن. النجمة السباعية: ترمز إلى الانتماء والسبع المثاني. هوّية: الهويّة الوطنية الأردنية. انتماء: وتعني الإيمان بكيان الدولة، والتَّضحية من أجلها. مواطنة: وتعني الحقوق والواجبات الدستورية والوطنيّة.',
  logoSignificanceEn: 'The spike: Symbolizes the earth, goodness, and prosperity. The circle: The circle embracing the map of the Hashemite Kingdom of Jordan in the colors of the Jordanian flag symbolizes the identity of the state, its protected borders, and belonging to the national soil. The joined hands: Symbolize cohesion, sacrifice, and redemption for the homeland. The seven-pointed star: Symbolizes belonging and the Al-Sab\' Al-Mathani. Identity: The Jordanian national identity. Belonging: Means belief in the entity of the state and sacrifice for it. Citizenship: Means constitutional and national rights and duties.',
  unitsIntro: 'تُقسَّم الأكاديمية إلى وحدات إدارية، يعيَّن لكل وحدة مدير أو منسق يخضع مباشرة للمدير التنفيذي، وتُحدَّد لوحة مهام تشمل المهام والمسؤوليات ومعايير الأداء.',
  unitsIntroEn: 'The Academy is divided into administrative units. A manager or coordinator is appointed for each unit, reporting directly to the Executive Director, and a task board is defined that includes tasks, responsibilities, and performance standards.'
};

export const operationalTargets: OperationalTarget[] = [
  { id: 'target-1', sourceStatus: 'SOURCE_VERIFIED', label: 'عضو حزبي مدرّب', labelEn: 'Trained Party Member', targetValue: '+300' },
  { id: 'target-2', sourceStatus: 'SOURCE_VERIFIED', label: 'تغطية بالمحافظات', labelEn: 'Governorate Coverage', targetValue: '6' },
  { id: 'target-3', sourceStatus: 'SOURCE_VERIFIED', label: 'مدرب معتمد', labelEn: 'Certified Trainer', targetValue: '10' },
  { id: 'target-4', sourceStatus: 'SOURCE_VERIFIED', label: 'تمثيل الشباب تحت 35 عامًا والنساء في البرامج', labelEn: 'Representation of Youth (<35) and Women', targetValue: '30% - 40%' }
];

export const trainingPackages: TrainingPackage[] = [
  { id: 'tp-1', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'مدخل إلى الفكر المحافظ', titleEn: 'Introduction to Conservative Thought', slideRange: { from: 1, to: 9 } },
  { id: 'tp-2', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'خصوصية التجربة الأردنية', titleEn: 'The Specificity of the Jordanian Experience', slideRange: { from: 9, to: 16 } },
  { id: 'tp-3', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'الأسس الفكرية للمحافظة الأردنية', titleEn: 'The Intellectual Foundations of Jordanian Conservatism', slideRange: { from: 17, to: 24 } },
  { id: 'tp-4', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'الهوية الأردنية والمواطنة', titleEn: 'Jordanian Identity and Citizenship', slideRange: { from: 25, to: 37 } },
  { id: 'tp-5', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'الدولة في الفكر المحافظ الأردني', titleEn: 'The State in Jordanian Conservative Thought', slideRange: { from: 38, to: 53 } },
  { id: 'tp-6', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'الاقتصاد في الفكر المحافظ الأردني', titleEn: 'The Economy in Jordanian Conservative Thought', slideRange: { from: 54, to: 63 } },
  { id: 'tp-7', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'المجتمع والأسرة في الفكر المحافظ الأردني', titleEn: 'Society and Family in Jordanian Conservative Thought', slideRange: { from: 64, to: 71 } },
  { id: 'tp-8', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'السياسة والإصلاح في الفكر المحافظ', titleEn: 'Politics and Reform in Conservative Thought', slideRange: { from: 72, to: 96 } },
  { id: 'tp-9', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'السياسة الخارجية في الفكر المحافظ', titleEn: 'Foreign Policy in Conservative Thought', slideRange: { from: 97, to: 113 } },
  { id: 'tp-10', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'التحديات المعاصرة للفكر المحافظ في الأردن', titleEn: 'Contemporary Challenges for Conservative Thought in Jordan', slideRange: { from: 114, to: 119 } },
  { id: 'tp-11', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'المحافظة الأردنية مقارنة بمدارس أخرى', titleEn: 'Jordanian Conservatism Compared to Other Schools', slideRange: { from: 120, to: 122 } },
  { id: 'tp-12', provenance: 'SOURCE_VERIFIED', source: 'الحقائب التدريبية.docx', title: 'مستقبل الفكر المحافظ في الأردن', titleEn: 'The Future of Conservative Thought in Jordan', slideRange: { from: 123, to: 125 } },
];

export const academyUnits: AcademyUnit[] = [
  {
    id: 'unit-1', sourceStatus: 'SOURCE_VERIFIED', 
    name: 'وحدة المناهج والتقييم', nameEn: 'Curriculum & Evaluation Unit',
    responsibilities: [
      'إعداد وتصميم الحقائب التدريبية والمناهج.',
      'اعتماد المحتوى بالتعاون مع الخبراء والمراكز البحثية.',
      'بناء نظام تقييم قبل/بعد التدريب.',
      'إصدار دليل مدربين داخلي.'
    ],
    responsibilitiesEn: [
      'Preparing and designing training packages and curricula.',
      'Approving content in cooperation with experts and research centers.',
      'Building a pre/post training evaluation system.',
      'Issuing an internal trainers manual.'
    ]
  },
  {
    id: 'unit-2', sourceStatus: 'SOURCE_VERIFIED', 
    name: 'وحدة التدريب والتمكين', nameEn: 'Training & Empowerment Unit',
    responsibilities: [
      'تنفيذ الورش والدورات والمعسكرات.',
      'إدارة المتدربين والكوادر التدريبية.',
      'التنسيق مع المحافظات ومراكز الشباب.',
      'إصدار الشهادات وجدولة البرامج.'
    ],
    responsibilitiesEn: [
      'Implementing workshops, courses, and camps.',
      'Managing trainees and training cadres.',
      'Coordinating with governorates and youth centers.',
      'Issuing certificates and scheduling programs.'
    ]
  },
  {
    id: 'unit-3', sourceStatus: 'SOURCE_VERIFIED', 
    name: 'وحدة البحث والسياسات', nameEn: 'Research & Policy Unit',
    responsibilities: [
      'إعداد أوراق سياسات تخدم رؤية الحزب بالتعاون مع اللجان المتخصصه في الحزب.',
      'تحليل القوانين والأنظمة الوطنية.',
      'التعاون مع الجامعات والمراكز الفكرية.',
      'إصدار نشرات معرفية فصلية.'
    ],
    responsibilitiesEn: [
      'Preparing policy papers serving the party\'s vision in cooperation with specialized committees.',
      'Analyzing national laws and regulations.',
      'Cooperating with universities and intellectual centers.',
      'Issuing quarterly knowledge bulletins.'
    ]
  },
  {
    id: 'unit-4', sourceStatus: 'SOURCE_VERIFIED', 
    name: 'وحدة الإعلام والتواصل المجتمعي', nameEn: 'Media & Community Outreach Unit',
    responsibilities: [
      'إدارة هوية الأكاديمية الرقمية وصفحاتها.',
      'تصميم الحملات التوعوية والإعلانات.',
      'إعداد التقارير المصوّرة والتوثيق الإعلامي.',
      'التواصل مع وسائل الإعلام الوطنية.'
    ],
    responsibilitiesEn: [
      'Managing the digital identity of the academy and its pages.',
      'Designing awareness campaigns and advertisements.',
      'Preparing illustrated reports and media documentation.',
      'Communicating with national media.'
    ]
  },
  {
    id: 'unit-5', sourceStatus: 'SOURCE_VERIFIED', 
    name: 'وحدة الشراكات والدعم المالي', nameEn: 'Partnerships & Financial Support Unit',
    responsibilities: [
      'بناء علاقات مع وزارة الشباب، صندوق الملك عبدالله للتنمية، المعهد الهولندي للديمقراطية متعددة الأحزاب والهيئة المستقلة.',
      'البحث عن تمويلات صغيرة.',
      'إدارة المنح والمذكرات (ان وجدت).',
      'متابعة العقود والتقارير المالية للمشاريع (ان وجدت).'
    ],
    responsibilitiesEn: [
      'Building relationships with the Ministry of Youth and development funds.',
      'Searching for micro-financing.',
      'Managing grants and memorandums.',
      'Following up on contracts and financial reports for projects.'
    ]
  }
];

export const timelinePhases: TimelinePhase[] = [
  {
    id: 'phase-1', sourceStatus: 'SOURCE_VERIFIED',
    phase: 'المرحلة 1: التأسيس', phaseEn: 'Phase 1: Establishment',
    duration: 'الشهر 1–2', durationEn: 'Month 1-2',
    goal: 'تشغيل الأكاديمية رسميًا', goalEn: 'Officially operating the Academy',
    activities: [
      'اعتماد النظام الأساسي',
      'إعداد 3 حقائب تدريبية أساسية',
      'تجهيز نموذج تسجيل + قاعدة بيانات',
      'تحديد أماكن التدريب'
    ],
    activitiesEn: [
      'Approving the basic system',
      'Preparing 3 basic training packages',
      'Preparing a registration form + database',
      'Determining training locations'
    ],
    outputs: [
      'إطلاق رسمي للأكاديمية',
      '3 برامج جاهزة للتنفيذ',
      'قاعدة بيانات أولية (100 عضو)'
    ],
    outputsEn: [
      'Official launch of the Academy',
      '3 programs ready for implementation',
      'Initial database (100 members)'
    ]
  },
  {
    id: 'phase-2', sourceStatus: 'SOURCE_VERIFIED',
    phase: 'المرحلة 2: التشغيل الأولي', phaseEn: 'Phase 2: Initial Operation',
    duration: 'الشهر 3–5', durationEn: 'Month 3-5',
    goal: 'بدء التدريب الفعلي', goalEn: 'Starting actual training',
    activities: [
      'تنفيذ 3 ورش مركزية',
      'إطلاق محتوى رقمي للأكاديمية',
      'استقطاب مدربين داخليين'
    ],
    activitiesEn: [
      'Implementing 3 central workshops',
      'Launching digital content for the Academy',
      'Attracting internal trainers'
    ],
    outputs: [
      'تدريب 50–75 مشارك',
      'ثلاث فعاليات ناجحة'
    ],
    outputsEn: [
      'Training 50-75 participants',
      'Three successful events'
    ]
  },
  {
    id: 'phase-3', sourceStatus: 'SOURCE_VERIFIED',
    phase: 'المرحلة 3: التوسع', phaseEn: 'Phase 3: Expansion',
    duration: 'الشهر 6–9', durationEn: 'Month 6-9',
    goal: 'الانتشار في المحافظات', goalEn: 'Expansion in the governorates',
    activities: [
      'تنفيذ 6 ورش في المحافظات',
      'إطلاق برنامج "مدرب معتمد حزبي"',
      'توقيع شراكتين'
    ],
    activitiesEn: [
      'Implementing 6 workshops in the governorates',
      'Launching "Certified Party Trainer" program',
      'Signing two partnerships'
    ],
    outputs: [
      'تدريب 150–200 مشارك إضافي',
      '10 مدربين معتمدين',
      'وجود فعلي في 5–6 محافظات'
    ],
    outputsEn: [
      'Training 150-200 additional participants',
      '10 certified trainers',
      'Actual presence in 5-6 governorates'
    ]
  },
  {
    id: 'phase-4', sourceStatus: 'SOURCE_VERIFIED',
    phase: 'المرحلة 4: التمكين والتأثير', phaseEn: 'Phase 4: Empowerment and Impact',
    duration: 'الشهر 10–12', durationEn: 'Month 10-12',
    goal: 'بناء قيادات حزبية', goalEn: 'Building party leaders',
    activities: [
      'تنفيذ برنامج قيادات متقدمة',
      'تنظيم مؤتمر شبابي حزبي',
      'إصدار تقرير سنوي'
    ],
    activitiesEn: [
      'Implementing an advanced leadership program',
      'Organizing a party youth conference',
      'Issuing an annual report'
    ],
    outputs: [
      '30–50 قائد شاب مؤهل',
      'مؤتمر وطني واصدار تقرير رسمي'
    ],
    outputsEn: [
      '30-50 qualified young leaders',
      'National conference and issuing an official report'
    ]
  }
];

export const trainingPrograms: TrainingProgram[] = [
  // VERIFIED PROGRAMS
  {
    id: 'prog-1',
    sourceStatus: 'SOURCE_VERIFIED',
    sourceReference: 'الخطة والأهداف - المرحلة 2',
    title: 'الورش المركزية',
    titleEn: 'Central Workshops',
    description: 'ورش تدريبية تعقد في عمّان وشمال وجنوب المملكة لتدريب المشاركين.',
    descriptionEn: 'Training workshops held in Amman, North, and South of the Kingdom.',
    audience: 'أعضاء الحزب (العدد المستهدف: 50-75 مشارك)',
    audienceEn: 'Party Members (Target: 50-75 participants)',
    type: 'ورشة عمل (Workshop)',
    status: 'مخطط (Planned)'
  },
  {
    id: 'prog-2',
    sourceStatus: 'SOURCE_VERIFIED',
    sourceReference: 'الخطة والأهداف - المرحلة 3',
    title: 'ورش المحافظات',
    titleEn: 'Governorate Workshops',
    description: 'تنفيذ 6 ورش تدريبية في المحافظات لتوسيع الانتشار.',
    descriptionEn: 'Executing 6 training workshops in governorates to expand reach.',
    audience: 'أعضاء الحزب في المحافظات (العدد المستهدف: 150-200 مشارك)',
    audienceEn: 'Party Members in Governorates (Target: 150-200 participants)',
    type: 'ورشة عمل (Workshop)',
    status: 'مخطط (Planned)'
  },
  {
    id: 'prog-3',
    sourceStatus: 'SOURCE_VERIFIED',
    sourceReference: 'الخطة والأهداف - المرحلة 3',
    title: 'مدرب معتمد حزبي',
    titleEn: 'Certified Party Trainer',
    description: 'برنامج لإعداد واعتماد مدربين داخليين للأكاديمية.',
    descriptionEn: 'Program to prepare and certify internal trainers for the academy.',
    audience: 'كوادر التدريب',
    type: 'برنامج اعتماد (Certification Program)',
    status: 'مخطط (Planned)'
  },
  {
    id: 'prog-4',
    sourceStatus: 'SOURCE_VERIFIED',
    sourceReference: 'الخطة والأهداف - المرحلة 4',
    title: 'برنامج قيادات متقدمة',
    titleEn: 'Advanced Leadership Program',
    description: 'برنامج تدريبي متقدم لتأهيل وتمكين القيادات الشابة في الحزب.',
    descriptionEn: 'Advanced training program to qualify and empower young leaders in the party.',
    audience: 'القيادات الشابة (العدد المستهدف: 30-50 قائد شاب مؤهل)',
    type: 'برنامج قيادي (Leadership Program)',
    status: 'مخطط (Planned)'
  },
  {
    id: 'prog-5',
    sourceStatus: 'SOURCE_VERIFIED',
    sourceReference: 'الخطة والأهداف - المرحلة 4',
    title: 'مؤتمر شبابي حزبي',
    titleEn: 'Party Youth Conference',
    description: 'مؤتمر وطني للشباب لتبادل الرؤى والأفكار وتفعيل دور الشباب.',
    descriptionEn: 'National youth conference to exchange visions and ideas and activate the role of youth.',
    audience: 'الشباب',
    type: 'مؤتمر (Conference)',
    status: 'مخطط (Planned)'
  },

  // USER SPECIFIED PROGRAMS
  {
    id: 'prog-user-1',
    sourceStatus: 'USER_SPECIFIED',
    sourceReference: 'طلب المستخدم (قيد التوثيق في المصادر الرسمية)',
    title: 'عضو مؤسس',
    titleEn: 'Founding Member',
    duration: '12 ساعة تدريبية',
    durationEn: '12 Training Hours',
    type: 'برنامج تأسيسي (Foundational Program)',
    typeEn: 'Foundational Program',
    status: 'مقترح (Proposed)',
    statusEn: 'Proposed'
  },
  {
    id: 'prog-user-2',
    sourceStatus: 'USER_SPECIFIED',
    sourceReference: 'طلب المستخدم (قيد التوثيق في المصادر الرسمية)',
    title: 'مدرسة الكوادر القيادية',
    titleEn: 'Leadership Cadres School',
    duration: '44 ساعة تدريبية',
    durationEn: '44 Training Hours',
    type: 'برنامج متقدم (Advanced Program)',
    typeEn: 'Advanced Program',
    status: 'مقترح (Proposed)',
    statusEn: 'Proposed'
  },
  {
    id: 'prog-user-3',
    sourceStatus: 'USER_SPECIFIED',
    sourceReference: 'طلب المستخدم (قيد التوثيق في المصادر الرسمية)',
    title: 'ديوانية الأكاديمية',
    titleEn: 'Academy Diwaniya',
    type: 'لقاءات دورية (Periodic Meetings)',
    typeEn: 'Periodic Meetings',
    status: 'مقترح (Proposed)',
    statusEn: 'Proposed'
  }
];
