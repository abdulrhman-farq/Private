// شهر العسل — ذكريات عبدالرحمن ورويدة (مستخرجة من تسجيل الرحلة الصوتي).
// لا يُعرض النص الخام؛ فقط ذكريات منظّمة بصياغة لطيفة ومحترمة.
// نوع الذكرى: { id, title, category, location?, timestamp?, story, quote?, people[], tags[], sourceConfidence, privateOnly }

export const HM_HERO = {
  title: 'شهر العسل',
  subtitle: 'ذكرياتنا الأولى بعد الزواج',
  intro: 'رحلة بدأناها كزوجين، ووثّقنا فيها ضحكنا، خوفنا، قراراتنا، حبّنا، وأول أحلامنا للمستقبل.',
  cta: 'افتحي الذكريات',
}

// خط زمني للرحلة — كل بطاقة: مكان · عنوان · قصة قصيرة · مزاج · اقتباس اختياري.
export const HM_TIMELINE = [
  { id: 't1', location: 'البيت — الرياض', title: 'قبل السفر في البيت', cat: 'romantic', mood: 'رومانسي', story: 'ليلة قبل الرحلة، تعشّينا مع العائلة (عمّه محمد سوّى لنا برغر وستيك خرافي)، ورتّبنا الشنط، وعشنا ليلتنا الأولى الخاصة بعد الزواج.', quote: 'الحمد لله عبدالرحمن ساعدني، خلصنا الشنط.' },
  { id: 't2', location: 'الطريق للمطار', title: 'الذهاب للمطار', cat: 'funny', mood: 'مضحك', story: 'سلّمنا على جدّه وركبنا مع السواق مبارك، عدّينا على البنك، وأخذنا ماتشا أول شي عشان «نروق».', quote: 'ما تصحصح ماما إلا بماتشا.' },
  { id: 't3', location: 'مطار الدوحة', title: 'الموظفة التي ساعدتنا', cat: 'funny', mood: 'مضحك', story: 'موظفة لطيفة ساعدتنا نقعد جنب بعض لأننا عرسان، بعد ما شرح لها عبدالرحمن بأسلوبه الذكي.', quote: 'إن شاء الله دوم تكوني مروقة.' },
  { id: 't4', location: 'في الطائرة', title: 'أجمل رحلة طيران', cat: 'romantic', mood: 'رومانسي', story: 'أفخم رحلة طيران بحياتنا: مقاعد تفتح على سرير واحد، خصوصية وراحة، شفنا أفلام ونمنا.', quote: 'كأني ما رحت ولا جيت.' },
  { id: 't5', location: 'دنباسار — بالي', title: 'الوصول إلى بالي', cat: 'travel', mood: 'هادئ', story: 'سوّينا الفيزا وصرفنا كاش وأخذنا شريحة وسواق. الطريق ساعة ونص، ورويدة تعبت شوي من الحر.', quote: 'ناس لطيفة، ودودة، وأدب.' },
  { id: 't6', location: 'أوبود', title: 'الفندق الأول', cat: 'hotel', mood: 'رومانسي', story: 'فندق فوق الجبل وسط الطبيعة، مسبح خاص، مكان يوسّع الصدر وياخذ العقل.', quote: 'مكان out of this world.' },
  { id: 't7', location: 'مطعم Dona — أوبود', title: 'مطعم Dona والـ Paella', cat: 'food', mood: 'رومانسي', story: 'أول عشاء لنا: paella وسالمون مع غواكامولي، وجلسة لاونج رايقة.', quote: 'first day with Rudy.' },
  { id: 't8', location: 'أوبود', title: 'أول مساج في الرحلة', cat: 'romantic', mood: 'هادئ', story: 'سوّينا مساج وارتحنا لدرجة نمنا بدون ما نحس.', privateOnly: true },
  { id: 't9', location: 'النهر — أوبود', title: 'الرافتنق', cat: 'adventure', mood: 'مغامرة', story: 'نزلنا للنهر ولعبنا رافتنق، كان معنا كوريان جادّين ما يضحكون أبدًا وإحنا نضحك ونطشّر الناس.', quote: 'هم couples وإحنا couples.' },
  { id: 't10', location: 'النهر', title: 'ماء جوز الهند في النهر', cat: 'romantic', mood: 'هادئ', story: 'وقفة بنص النهر، شربنا coconut طازج، ورويدة تحب كل شي طبيعي وأورجانك.' },
  { id: 't11', location: 'المنتجع', title: 'المسبح والشلال', cat: 'romantic', mood: 'رومانسي', story: 'سبحنا في مسبح وسط الطبيعة فيه شلال، حسّيناه طبيعي مو منتجع.', quote: 'كنا قلنا مو resort، سبحان الله.' },
  { id: 't12', location: 'سبا المنتجع', title: 'السبا', cat: 'funny', mood: 'هادئ', story: 'السبا كان قد المنتجع كله، وروّقنا لدرجة نمنا.', quote: 'مفهوم السبا نوم.' },
  { id: 't13', location: 'النهر', title: 'موقف الموز', cat: 'funny', mood: 'مضحك', story: 'عبدالرحمن اشترى عنقود موز كامل من بيّاع بالنهر بمفاوضة مضحكة، قال ناكل وحدة كل يوم ونصوّر.', quote: 'How much for all the bananas? — All!' },
  { id: 't14', location: 'الغرفة', title: 'رقصتنا في الغرفة', cat: 'romantic', mood: 'مضحك', story: 'بالليل شغّلنا موسيقى ورقصنا بالغرفة، وطلعت رقصة رويدة فلّة وعبدالرحمن ما توقّع.', quote: 'طلع fun.' },
  { id: 't15', location: 'أوبود', title: 'ATV وروح المغامرة', cat: 'adventure', mood: 'مغامرة', story: 'كل واحد ركب دبّاب ATV بالطين والتراب، مغامرة ومرح وعبدالرحمن يحب الحركة.', quote: 'حركة بركة.' },
  { id: 't16', location: 'Organic Farm — أوبود', title: 'Organic Farm والأفوكادو', cat: 'food', mood: 'هادئ', story: 'مزرعة عضوية على النهر، ياخذون ثمارها ويطبخونها لنا: تاكو وأفوكادو ورز مع سالمون.', quote: 'أفضل أفوكادو شفته.' },
  { id: 't17', location: 'السوق', title: 'السوق وملابس البحر الستيرة', cat: 'deep', mood: 'عميق', story: 'تمشّينا بالسوق واشترينا لبس بحر ساتر، لأن رويدة تحب الستر وعبدالرحمن يقدّر هالشي.', quote: 'كل واحد يعرف قدر نفسه.' },
  { id: 't18', location: 'الطريق لنوسا دوا', title: 'Rice Terrace وتغيير الخطة', cat: 'deep', mood: 'عميق', story: 'اكتشفنا Rice Terrace فجأة وغيّرنا الخطة، وتعلّمنا إننا نقول لبعض الوجهة عشان نتهيّأ.', quote: 'changing the plan — it’s okay، إحنا للبعض ونحمي بعض.' },
  { id: 't19', location: 'نوسا دوا', title: 'الفندق الجديد', cat: 'hotel', mood: 'مضحك', story: 'وصلنا منتجع نوسا دوا walk-in بدون حجز، واستقبلونا استقبال حلو، حسّينا كأننا «قانقستر» معنا كاش كثير.', sourceConfidence: 'needs-review' },
  { id: 't20', location: 'العشاء', title: 'العشاء الرومانسي', cat: 'romantic', mood: 'رومانسي', story: 'تكشّخنا وتعشّينا ستيك بالمنتجع، وأهدونا حلا تارت وتشيز كيك مكتوب عليه Happy Honeymoon.', quote: 'happy honeymoon 🤍' },
  { id: 't21', location: 'الشاطئ — نوسا دوا', title: 'الشاطئ وحديث المستقبل', cat: 'future', mood: 'عميق', story: 'على الشاطئ تحت القمر، تكلّمنا عن أطفالنا: وش بنسمّيهم وكيف بنربّيهم، أحلى الأحلام.', quote: 'أحس اللي قدام هو أحلى أيام حياتي.' },
  { id: 't22', location: 'الشاطئ', title: 'الحب الكبير لازم يصير متين', cat: 'deep', mood: 'عميق', story: 'اتفقنا إن حبّنا كبير، بس ما يكفي يكون كبير، لازم يصير متين بالأساس والمواقف.', quote: 'ما يكفي الحب يكون بس كبير… لازم متين.' },
]

// بطاقات ذكريات — نفس المحتوى بصياغة بطاقات للأرشيف.
export const HM_MEMORIES = [
  { id: 'm1', title: 'رسالة لأولادنا المستقبليين', category: 'future', story: 'سجّلنا هذه الرحلة بأصواتنا لكم يا أحلى أولادنا، عشان تسمعونها بعد سنين وتعرفون كيف بدأ حبّ بابا وماما.', quote: 'بنعطيها أولادنا الحلوين.', people: ['عبدالرحمن', 'رويدة'], tags: ['عائلة', 'ذكرى'], sourceConfidence: 'high' },
  { id: 'm2', title: 'قلق الشنط قبل السفر', category: 'funny', story: 'رويدة تحب الاستقرار والترتيب، فجاها قلق تجهيز الشنط، وعبدالرحمن ساعدها لين خلصوا وارتاحت.', quote: 'أنا أحب الاستقرار.', people: ['رويدة'], tags: ['تحضير'], sourceConfidence: 'high' },
  { id: 'm3', title: 'الموظفة التي ساعدتنا في المقاعد', category: 'funny', location: 'الدوحة', story: 'موظفة لطيفة ساعدتنا نجلس جنب بعض لأننا عرسان، بعد لطف عبدالرحمن وحديثه.', people: ['عبدالرحمن', 'رويدة'], tags: ['مطار'], sourceConfidence: 'high' },
  { id: 'm4', title: 'أجمل رحلة طيران', category: 'romantic', story: 'أفخم رحلة طيران بحياتنا، راحة وخصوصية حسّيناها كأنها لحظة واحدة.', quote: 'كأني ما رحت ولا جيت.', people: ['عبدالرحمن', 'رويدة'], tags: ['سفر'], sourceConfidence: 'high' },
  { id: 'm5', title: 'أول يوم في أوبود', category: 'hotel', location: 'أوبود', story: 'فندق فوق الجبل وسط الطبيعة، يوسّع الصدر وياخذ العقل.', quote: 'مكان out of this world.', people: ['عبدالرحمن', 'رويدة'], tags: ['فندق', 'طبيعة'], sourceConfidence: 'high' },
  { id: 'm6', title: 'مطعم Dona والـ Paella', category: 'food', location: 'أوبود', story: 'أول عشاء لنا: paella وسالمون مع غواكامولي، وجلسة رايقة.', people: ['عبدالرحمن', 'رويدة'], tags: ['مطعم'], sourceConfidence: 'high' },
  { id: 'm7', title: 'أول مساج في الرحلة', category: 'romantic', story: 'مساج وراحة، ارتحنا لدرجة نمنا بدون ما نحس.', people: ['عبدالرحمن', 'رويدة'], tags: ['راحة'], sourceConfidence: 'high', privateOnly: true },
  { id: 'm8', title: 'الرافتنق والكوريين الجادين', category: 'adventure', location: 'النهر', story: 'رافتنق بالنهر، مع كوريين جادّين ما يضحكون، وإحنا نضحك ونلعب.', quote: 'هم couples وإحنا couples.', people: ['عبدالرحمن', 'رويدة'], tags: ['مغامرة'], sourceConfidence: 'high' },
  { id: 'm9', title: 'ماء جوز الهند في النهر', category: 'romantic', location: 'النهر', story: 'وقفة بنص النهر وشربنا coconut طازج، ورويدة تحب كل شي طبيعي.', people: ['رويدة'], tags: ['طبيعي'], sourceConfidence: 'high' },
  { id: 'm10', title: 'المسبح والشلال', category: 'romantic', story: 'مسبح وسط الطبيعة فيه شلال، حسّيناه طبيعي مو منتجع.', people: ['عبدالرحمن', 'رويدة'], tags: ['سباحة'], sourceConfidence: 'high' },
  { id: 'm11', title: 'سبا النوم والراحة', category: 'funny', story: 'سبا قد المنتجع كله، وروّقنا لدرجة نمنا.', quote: 'مفهوم السبا نوم.', people: ['عبدالرحمن', 'رويدة'], tags: ['سبا'], sourceConfidence: 'high' },
  { id: 'm12', title: 'عنقود الموز الكامل', category: 'funny', story: 'عبدالرحمن اشترى عنقود موز كامل بمفاوضة مضحكة، قال ناكل وحدة كل يوم.', quote: 'How much for all the bananas? — All!', people: ['عبدالرحمن'], tags: ['طرفة'], sourceConfidence: 'high' },
  { id: 'm13', title: 'رقصتنا في الغرفة', category: 'romantic', story: 'شغّلنا موسيقى ورقصنا بالغرفة، وطلعت رقصة رويدة فلّة.', quote: 'طلع fun.', people: ['عبدالرحمن', 'رويدة'], tags: ['مرح'], sourceConfidence: 'high', privateOnly: true },
  { id: 'm14', title: 'ATV وروح المغامرة', category: 'adventure', story: 'كل واحد ركب دبّاب ATV بالطين، مغامرة ومرح.', quote: 'حركة بركة.', people: ['عبدالرحمن', 'رويدة'], tags: ['مغامرة'], sourceConfidence: 'high' },
  { id: 'm15', title: 'Organic Farm والأفوكادو', category: 'food', location: 'أوبود', story: 'مزرعة عضوية على النهر، ثمارها تُطبخ لنا، أفضل أفوكادو شفناه.', people: ['عبدالرحمن', 'رويدة'], tags: ['مزرعة'], sourceConfidence: 'high' },
  { id: 'm16', title: 'السوق وملابس البحر الستيرة', category: 'deep', story: 'اشترينا لبس بحر ساتر، لأن رويدة تحب الستر وعبدالرحمن يقدّر قيمها.', quote: 'كل واحد يعرف قدر نفسه.', people: ['عبدالرحمن', 'رويدة'], tags: ['قيم', 'ستر'], sourceConfidence: 'high' },
  { id: 'm17', title: 'Rice Terrace وتغيير الخطة', category: 'deep', story: 'اكتشفنا Rice Terrace فجأة وغيّرنا الخطة، وتعلّمنا نتشارك الوجهة عشان نتهيّأ.', quote: 'إحنا للبعض ونحمي بعض.', people: ['عبدالرحمن', 'رويدة'], tags: ['درس'], sourceConfidence: 'high' },
  { id: 'm18', title: 'الوصول إلى نوسا دوا', category: 'hotel', location: 'نوسا دوا', story: 'منتجع فخم walk-in بدون حجز، استقبال حلو.', people: ['عبدالرحمن', 'رويدة'], tags: ['فندق'], sourceConfidence: 'needs-review' },
  { id: 'm19', title: 'الغرفة ذات السريرين', category: 'funny', location: 'نوسا دوا', story: 'أول ما دخلنا لقينا الغرفة بسريرين، رويدة جاها جلطة وقالت لا! فغيّرنا الغرفة.', quote: 'يا ويلي، كذا لا!', people: ['رويدة'], tags: ['طرفة'], sourceConfidence: 'high' },
  { id: 'm20', title: 'العشاء وحلا Happy Honeymoon', category: 'romantic', location: 'نوسا دوا', story: 'تكشّخنا وتعشّينا ستيك، وأهدونا حلا مكتوب عليه Happy Honeymoon.', quote: 'happy honeymoon 🤍', people: ['عبدالرحمن', 'رويدة'], tags: ['عشاء'], sourceConfidence: 'high' },
  { id: 'm21', title: 'حديث الشاطئ عن أطفالنا', category: 'future', location: 'الشاطئ', story: 'تحت القمر تكلّمنا عن أطفالنا وأسماءهم وتربيتهم، أحلى الأحلام.', quote: 'أحس اللي قدام هو أحلى أيام حياتي.', people: ['عبدالرحمن', 'رويدة'], tags: ['مستقبل', 'عائلة'], sourceConfidence: 'high' },
  { id: 'm22', title: 'الحب الكبير الذي يجب أن يصبح متينًا', category: 'deep', story: 'حبّنا كبير، بس ما يكفي يكون كبير، لازم يصير متين بالأساس والمواقف والتضحية والوفاء.', quote: 'ما يكفي الحب يكون بس كبير… لازم متين.', people: ['عبدالرحمن', 'رويدة'], tags: ['وعد', 'عمق'], sourceConfidence: 'high' },
]

export const HM_QUOTES = [
  { text: 'أنا مرة أحبك رويدة.', type: 'romantic' },
  { text: 'أقسم بالله العظيم إني أحبك حب طبيعي.', type: 'romantic' },
  { text: 'أنتِ أكشخ واحدة في الكون كله.', type: 'romantic' },
  { text: 'رويدة الحين صارت كل حياتي.', type: 'romantic' },
  { text: 'مفهوم السبا نوم.', type: 'funny' },
  { text: 'How much for all the bananas? — All!', type: 'funny' },
  { text: 'كأني ما رحت ولا جيت.', type: 'funny' },
  { text: 'نحب بعض، نعيش مع بعض، نتأقلم على بعض.', type: 'deep' },
  { text: 'الحب ما يكفي يكون كبير… لازم يكون متين.', type: 'deep' },
  { text: 'التأسيس يجي مع الوقت، يجي مع المواقف، يجي مع التضحية، الإخلاص، الوفاء، الصدق.', type: 'deep' },
  { text: 'الحمد لله على نعمة الحب. الحمد لله على نعمة رويدة.', type: 'future' },
  { text: 'أحس اللي قدام هو أحلى أيام حياتي.', type: 'future' },
]

export const HM_PLACES = [
  { name: 'الرياض', note: 'البداية', confidence: 'high' },
  { name: 'الدوحة', note: 'ترانزيت', confidence: 'high' },
  { name: 'بالي · دنباسار', note: 'الوصول', confidence: 'high' },
  { name: 'أوبود', note: 'الفندق الأول', confidence: 'high' },
  { name: 'نوسا دوا', note: 'الفندق الثاني', confidence: 'high' },
  { name: 'Rice Terrace', note: 'مفاجأة جميلة', confidence: 'high' },
  { name: 'Organic Farm', note: 'مزرعة على النهر', confidence: 'high' },
  { name: 'مطعم Dona', note: 'أوبود', confidence: 'high' },
  { name: 'منتجع نوسا دوا', note: 'الاسم بحاجة تأكيد (ريتز كارلتون؟)', confidence: 'needs-review' },
  { name: 'الشاطئ', note: 'حديث المستقبل', confidence: 'high' },
  { name: 'النهر', note: 'الرافتنق', confidence: 'high' },
  { name: 'السبا', confidence: 'high' },
  { name: 'المسبح والشلال', confidence: 'high' },
]

export const HM_ACTIVITIES = [
  { icon: '🧳', label: 'ترتيب الشنط' }, { icon: '✈️', label: 'السفر' }, { icon: '🍵', label: 'الماتشا في المطار' },
  { icon: '🛬', label: 'الطيران الفاخر' }, { icon: '🎬', label: 'مشاهدة الأفلام' }, { icon: '🚣', label: 'الرافتنق' },
  { icon: '💆', label: 'المساج' }, { icon: '🏊', label: 'السباحة' }, { icon: '🧖', label: 'السبا' },
  { icon: '🍌', label: 'شراء الموز' }, { icon: '🏍️', label: 'ATV' }, { icon: '🌱', label: 'Organic Farm' },
  { icon: '🛍️', label: 'التسوق' }, { icon: '🍽️', label: 'عشاء رومانسي' }, { icon: '🏖️', label: 'المشي على الشاطئ' },
  { icon: '👶', label: 'حديث المستقبل والأطفال' },
]

export const HM_INSIGHTS = {
  ruwaida: ['تحب الاستقرار والترتيب', 'تقدّر الراحة والتفاصيل الجميلة', 'تحب الستر والحشمة', 'تهتم بالأمان العاطفي'],
  abdulrahman: ['يحب توثيق الذكريات', 'يحب يضحّك رويدة', 'يفاوض ويساعد', 'يحب المغامرة والتخطيط للمستقبل'],
  both: ['التأقلم مع بعض', 'المودّة والاحترام', 'المرح', 'بناء زواج متين'],
}

export const HM_FUTURE = [
  { icon: '👶', text: 'أطفالنا — أسماؤهم وتربيتهم' },
  { icon: '🏡', text: 'بناء زواج متين بالأساس والمواقف' },
  { icon: '✈️', text: 'رحلات قادمة سوا' },
  { icon: '🌾', text: 'فكرة أرض/مزرعة مستوحاة من بالي (بئر وبحيرة وزرع)' },
  { icon: '🎙️', text: 'نستمر نسجّل ونوثّق رحلتنا' },
  { icon: '💝', text: 'نحفظ الذكريات لأولادنا' },
]

export const HM_FILTERS = [
  { k: 'all', label: 'الكل' }, { k: 'romantic', label: 'رومانسي' }, { k: 'funny', label: 'مضحك' },
  { k: 'adventure', label: 'مغامرة' }, { k: 'food', label: 'مطاعم' }, { k: 'hotel', label: 'فنادق' },
  { k: 'deep', label: 'عميق' }, { k: 'future', label: 'مستقبل' },
]
