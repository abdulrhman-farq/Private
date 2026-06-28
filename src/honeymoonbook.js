// "Our Honeymoon" — a keepsake book version (English), rendered as a paged reader.
export const BOOK_COVER = {
  title: 'OUR HONEYMOON',
  authors: 'Abdulrahman & Ruwaida',
  place: 'Bali, Indonesia',
  date: 'June 2026',
  epigraph: ['Every great family begins with a story.', 'This is ours.'],
  byline: 'Narrated by Abdulrahman',
  photo: './honeymoon/kiss.jpg',
}

// النسخة العربية
export const BOOK_COVER_AR = {
  title: 'شهر العسل',
  authors: 'عبدالرحمن ورويدة',
  place: 'بالي، إندونيسيا',
  date: 'يونيو ٢٠٢٦',
  epigraph: ['كل عائلة جميلة تبدأ بقصّة.', 'وهذه قصّتنا.'],
  byline: 'بقلم عبدالرحمن',
  photo: './honeymoon/kiss.jpg',
}

export const BOOK_PAGES_AR = [
  { kind: 'dedication', label: 'الإهداء', title: 'الإهداء', lines: [
    'إلينا،', 'عسى ألّا ننسى هذه الأيام أبدًا.',
    'حين كان كل شيء جديدًا.',
    'حين كان كل صباح يحمل حماسًا.',
    'حين كان كل غروب يبدو نعمة.',
    'حين كنّا فقط زوجًا وزوجة،',
    'نتعلّم كم يمكن أن يكون «للأبد» جميلًا.', '',
    'وإلى أولادنا في المستقبل —',
    'قبل أن تُولدوا،',
    'كنّا نتحدّث عنكم.',
  ] },
  { kind: 'chapter', label: 'الفصل ١', n: 'الأول', title: 'قبل أن نسافر', lines: [
    'ما بدأ شهر العسل في بالي، بدأ في بيتنا — الليلة اللي قبل السفر.',
    'شنط مفتوحة، وملابس بكل مكان، وقوائم، وتأكيد جوازات، ووزن شنط، وسحّاب بعد سحّاب.',
    'خافت رويدة إنها نسيت شي، فابتسمت وقلت لها: «كل شي تمام».',
    'تعشّينا مع العائلة، ومحمد سوّى برغر خرافي، والأطفال صاروا «وَيترز» يدورون بالمنيو ياخذون الطلبات — كأن البيت تحوّل لمطعم مبني كلّه من الحب.',
    'قبل ما ننام، سكّرنا الشنط، فتحناها، سكّرناها مرة ثانية، وضحكنا.',
    'بكرة… تبدأ حياتنا سوا فعلًا.',
  ] },
  { kind: 'chapter', label: 'الفصل ٢', n: 'الثاني', title: 'صباح المطار', lines: [
    'جا الصباح أسرع مما توقّعت. وداع أخير، وحضنة أخيرة، ونظرة أخيرة للبيت.',
    'المطار كان مثيرًا بس هادئ. وقفنا على ماتشا، وسلّمنا الشنط، واكتشفت إن المسموح ٢٣ كيلو فقط — قلق بسيط وأعدت ترتيب الشنط بسرعة.',
    'وجا أول لطف غير متوقّع: موظفة ابتسمت، وعرفت إننا عرسان، ودبّرت لنا مقاعد جنب بعض.',
    'أحيانًا يصير الناس جزءًا من ذكرياتنا وهم ما يدرون.',
  ] },
  { kind: 'chapter', label: 'الفصل ٣', n: 'الثالث', title: 'الرحلة اللي ما بغينا تنتهي', lines: [
    'الطيران ما كان يومًا بهالإحساس. مقعدان صاروا سريرًا واحدًا. خصوصية، وأفلام، وإضاءة هادئة، وأحاديث، وأكل طيّب، وأغطية دافية.',
    'نمنا، وصحينا، وشفنا فيلمًا ثانيًا، وتشاركنا السناك، وتشاركنا الصمت.',
    'فيه رحلات أتذكّرها لأنها كانت طويلة، وفيه رحلات أتذكّرها لأني تمنّيت تطول أكثر. وهذي وحدة منها.',
  ] },
  { kind: 'chapter', label: 'الفصل ٤', n: 'الرابع', title: 'أهلاً بكم في بالي', lines: [
    'أول شي لفت انتباهي ما كان المطار — كانوا الناس. الكل يبتسم، والكل يرحّب.',
    'السواق ودّانا تجاه أوبود. الطريق طويل والجو حار، وتعبت رويدة شوي. وقفت معها — ماء بارد وهواء — وبعد دقائق صار كل شي تمام.',
    'وتعلّمت إن الحب أحيانًا هو ببساطة إنك تقف جنبها وهي تعبانة.',
  ] },
  { kind: 'chapter', label: 'الفصل ٥', n: 'الخامس', title: 'بيتنا في الغابة', lines: [
    'ما كان فيه شي يجهّزني للمنتجع. ما كان فندقًا — كان عالمًا ثانيًا.',
    'مخبّأ وسط الغابة. مسبح خاص. أصوات طيور. أشجار بكل مكان. هدوء. سلام.',
    'وقفت أنا ورويدة بدون ما نتكلّم. أحيانًا الجمال ما يخلّي مكانًا للكلام.',
  ] },
  { kind: 'chapter', label: 'الفصل ٦', n: 'السادس', title: 'فطور في السرير', lines: [
    'فواكه طازجة، وأومليت، وكرواسون، وعصير طازج، وقهوة.',
    'بدون منبّهات. بدون اجتماعات. بدون شغل.',
    'أنا ورويدة فقط، نبدأ حياة جديدة سوا.',
  ] },
  { kind: 'chapter', label: 'الفصل ٧', n: 'السابع', title: 'الرافتنق', lines: [
    'من أعظم الأيام. نزلنا مئات الدرجات للوادي. النهر. الغابة.',
    'ضحك، ورشّ ماء، وقابلنا ثنائيًا ثانيًا، وشفنا شلالات، وشربنا جوز هند طازج، وحسّيت كأننا أطفال من جديد.',
    'ما كنت أحاول أبهر أحدًا. كنت فقط أستمتع إني معها.',
  ] },
  { kind: 'chapter', label: 'الفصل ٨', n: 'الثامن', title: 'الرقص', lines: [
    'ما توقّعت إن الرقص يصير من أحلى ذكرياتنا.',
    'موسيقى، وحُفاة، وداخل غرفتنا، وضحك، وأخطاء، ومحاولة من جديد.',
    'وما توقّعت إن رقصة رويدة تطلع بهالحلاوة. ما كان فيه جمهور ولا عرض — كان فيه فرح فقط.',
  ] },
  { kind: 'chapter', label: 'الفصل ٩', n: 'التاسع', title: 'السبا', lines: [
    'حسبت إننا رايحين مساج. وبدل كذا… نمنا. تمامًا.',
    'السبا يطلّ على الطبيعة. طيور، وماء جارٍ، وهواء نقي، وسلام.',
    'ولأول مرة من زمن، هدأ عقلي تمامًا.',
  ] },
  { kind: 'chapter', label: 'الفصل ١٠', n: 'العاشر', title: 'المزرعة العضوية', lines: [
    'خضار طازج، وأعشاب طازجة، وأفوكادو طازج، وسلمون طازج — كل شي جا مباشرة من المزرعة اللي جنبنا.',
    'الأكل يصير طعمه مختلف لمّا يجي من المكان اللي تاكل فيه.',
  ] },
  { kind: 'chapter', label: 'الفصل ١١', n: 'الحادي عشر', title: 'التسوّق سوا', lines: [
    'أسواق، وشوارع صغيرة، واختيار ملابس، وتجربة، وضحك، ونقاش بالألوان، وأخذنا وقتنا.',
    'مو لأننا محتاجين شي — بس لأني أستمتع إني أسوّي الأشياء العادية معها.',
  ] },
  { kind: 'chapter', label: 'الفصل ١٢', n: 'الثاني عشر', title: 'أحاديثنا', lines: [
    'يمكن هذا أهم جزء في شهر العسل. مو المنتجعات، ولا الشواطئ، ولا الأنشطة — الأحاديث.',
    'تكلّمت أنا ورويدة عن مستقبلنا، وأولادنا، والشغل، والأحلام، والمال، والإيمان، والعائلة، والكِبر سوا. كل شي.',
    'فيه أحاديث تغيّر حياتك للأبد.',
  ] },
  { kind: 'chapter', label: 'الفصل ١٣', n: 'الثالث عشر', title: 'حلمنا', lines: [
    'ليلة، بعد ما زرنا سبا خيالي، تخيّلت أنا ورويدة إننا نبني واحدًا مثله.',
    'مزرعة. بحيرة. طبيعة. أشجار. مكان هادئ.',
    'يمكن يوم من الأيام، ويمكن لا. بس الأحلام لمّا نتشاركها تصير أقوى.',
  ] },
  { kind: 'chapter', label: 'الفصل ١٤', n: 'الرابع عشر', title: 'الحب', lines: [
    'جملة وحدة من شهر عسلنا بقيت معي:',
    'الحب ما يكفي يطول… لازم يقوى.',
    'الحب يصير أقوى بالوفاء، والصبر، والمسامحة، والتضحية، والصدق، والوقت.',
    'وهذا من أعظم الدروس اللي تعلّمتها معها.',
  ] },
  { kind: 'chapter', label: 'الفصل ١٥', n: 'الخامس عشر', title: 'إلى أولادنا في المستقبل', lines: [
    'لو تقرأون هذا… ما كنتوا انولدتوا بعد. بس كنتوا في أحاديثنا.',
    'تخيّلت أنا وأمكم أسماءكم، وطباعكم، وضحكاتكم.',
    'ودعينا لكم، قبل ما نشوفكم بزمن.',
  ] },
  { kind: 'letter', label: 'رسالة', title: 'رسالة أخيرة', lines: [
    'عزيزتي رويدة،',
    'لو نسيت يومًا كم كانت هذي الرحلة جميلة، رجّعيني لهذي الصفحات.',
    'ذكّريني بالأنهار، والرقص، والفطور، والأحاديث، والأحلام، واللحظات الهادية.',
    'وأهم شي — ذكّريني كم أحببتك من أول لحظة.',
    'شكرًا إنك اخترتيني. وأنا بأستمر أختارك، كل يوم. للأبد.',
    '— عبدالرحمن',
  ] },
  { kind: 'back', label: 'الغلاف', title: '', lines: [
    'سافرنا إلى بالي في شهر عسلنا.',
    'ورجعنا بشيء أعظم بكثير.',
    'صداقة أقوى، وزواج أمتن، وبداية «للأبد».',
  ] },
]

// Each page: { kind, label, title?, n?, lines:[...] }  (empty string = stanza break)
export const BOOK_PAGES = [
  {
    kind: 'dedication', label: 'Dedication', title: 'Dedication',
    lines: [
      'To us,', 'May we never forget these days.',
      'When everything was new.',
      'When every morning was exciting.',
      'When every sunset felt like a blessing.',
      'When we were simply husband and wife,',
      'learning how beautiful forever could be.', '',
      'And to our future children —',
      'Before you were born,',
      'we were already talking about you.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 1', n: 'One', title: 'Before We Left',
    lines: [
      'The honeymoon didn’t begin in Bali. It began in our home — the night before the flight.',
      'Suitcases open. Clothes everywhere. Lists. Passport checks. Weight checks. One more zipper, then another.',
      'Ruwaida worried she had forgotten something. I smiled. “Everything is fine.”',
      'That evening we shared dinner with family. Mohammed prepared incredible burgers. The children became waiters, walking around with menus, taking everyone’s orders — the whole evening felt like a restaurant built entirely from love.',
      'Before sleeping, we closed the suitcases. Opened them again. Closed them again. Then laughed.',
      'Tomorrow… our life together would truly begin.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 2', n: 'Two', title: 'Airport Morning',
    lines: [
      'Morning arrived faster than expected. One last goodbye. One last hug. One last look at home.',
      'The airport was exciting, but also peaceful. We stopped for matcha. Checked our luggage. Realized the airline allowed only 23 kg — a small panic, some quick repacking.',
      'Then came the first unexpected kindness. An employee smiled, learned we were honeymooners, and found us seats together.',
      'Sometimes, people become part of your memories without ever realizing it.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 3', n: 'Three', title: 'The Flight We Never Wanted to End',
    lines: [
      'Flying had never felt like this. Two seats became one bed. Privacy. Movies. Soft lighting. Quiet conversations. Good food. Warm blankets.',
      'We slept. We woke up. Watched another movie. Shared snacks. Shared silence.',
      'There are flights you remember because they were long. And there are flights you remember because you wished they were longer. This was one of those.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 4', n: 'Four', title: 'Welcome to Bali',
    lines: [
      'The first thing we noticed wasn’t the airport. It was the people. Everyone smiled. Everyone welcomed us.',
      'The driver took us toward Ubud. The road was long, the weather was hot, and Ruwaida felt carsick. We stopped — cold water, fresh air — and a few minutes later everything was okay again.',
      'Sometimes love is simply standing beside someone while they feel unwell.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 5', n: 'Five', title: 'Our Jungle Home',
    lines: [
      'Nothing prepared us for the resort. It wasn’t a hotel — it felt like another world.',
      'Hidden inside the jungle. Private pool. Bird sounds. Trees everywhere. Quiet. Peace.',
      'We stood there without speaking. Sometimes beauty leaves no room for words.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 6', n: 'Six', title: 'Breakfast in Bed',
    lines: [
      'Fresh fruit. Omelette. Croissants. Fresh juice. Coffee.',
      'No alarms. No meetings. No work.',
      'Just two people beginning a new life together.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 7', n: 'Seven', title: 'Rafting',
    lines: [
      'One of the greatest days. Walking hundreds of stairs down into the valley. The river. The jungle.',
      'Laughing. Splashing water. Meeting another couple. Watching waterfalls. Drinking fresh coconut. Feeling like children again.',
      'We weren’t trying to impress anyone. We were simply enjoying being together.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 8', n: 'Eight', title: 'Dancing',
    lines: [
      'Neither of us expected dancing to become one of our favorite memories.',
      'Music. Barefoot. Inside our villa. Laughing. Making mistakes. Trying again.',
      'There wasn’t an audience. There wasn’t a performance. Just happiness.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 9', n: 'Nine', title: 'Spa',
    lines: [
      'We thought we were going for a massage. Instead… we fell asleep. Completely.',
      'The spa overlooked nature. Birds. Running water. Fresh air. Peace.',
      'For the first time in a long time, our minds became completely quiet.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 10', n: 'Ten', title: 'Organic Farm',
    lines: [
      'Fresh vegetables. Fresh herbs. Fresh avocado. Fresh salmon. Everything came directly from the farm beside us.',
      'Food somehow tastes different when it comes from the place where you’re eating it.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 11', n: 'Eleven', title: 'Shopping Together',
    lines: [
      'Markets. Small streets. Choosing clothes. Trying things on. Laughing. Discussing colors. Taking our time.',
      'Not because we needed anything. Because we simply enjoyed doing ordinary things together.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 12', n: 'Twelve', title: 'Our Conversations',
    lines: [
      'This may have been the most important part of the honeymoon. Not the resorts. Not the beaches. Not the activities. The conversations.',
      'We talked about our future. Our children. Business. Dreams. Money. Faith. Family. Growing old. Everything.',
      'Some conversations change your life forever.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 13', n: 'Thirteen', title: 'Our Dream',
    lines: [
      'One evening, after visiting an incredible spa, we imagined building one ourselves.',
      'A farm. A lake. Nature. Trees. A peaceful place.',
      'Maybe one day. Maybe not. But dreams shared together become stronger.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 14', n: 'Fourteen', title: 'Love',
    lines: [
      'One sentence from our honeymoon stayed with us:',
      'Love should not only grow taller. It should grow stronger.',
      'Love becomes stronger through loyalty, patience, forgiveness, sacrifice, honesty, and time.',
      'That was one of the greatest lessons we learned.',
    ],
  },
  {
    kind: 'chapter', label: 'Ch. 15', n: 'Fifteen', title: 'To Our Future Children',
    lines: [
      'If you’re reading this… you weren’t born yet. But you were already in our conversations.',
      'We imagined your names. Your personalities. Your laughter.',
      'We prayed for you, long before we ever met you.',
    ],
  },
  {
    kind: 'letter', label: 'Letter', title: 'Final Letter',
    lines: [
      'Dear Ruwaida,',
      'If I ever forget how beautiful this journey was, bring me back to these pages.',
      'Remind me of the rivers. The dancing. The breakfasts. The conversations. The dreams. The quiet moments.',
      'Most importantly — remind me how deeply I loved you from the very beginning.',
      'Thank you for choosing me. I will continue choosing you, every single day. Forever.',
      '— Abdulrahman',
    ],
  },
  {
    kind: 'back', label: 'Back', title: '',
    lines: [
      'We travelled to Bali for our honeymoon.',
      'We came home with something much greater.',
      'A stronger friendship. A stronger marriage. And the beginning of our forever.',
    ],
  },
]
