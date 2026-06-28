// "Our Honeymoon" — a keepsake book version (English), rendered as a paged reader.
export const BOOK_COVER = {
  title: 'OUR HONEYMOON',
  authors: 'Abdulrahman & Ruwaida',
  place: 'Bali, Indonesia',
  date: 'June 2026',
  epigraph: ['Every great family begins with a story.', 'This is ours.'],
}

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
      'Ruwaida worried she had forgotten something. Abdulrahman smiled. “Everything is fine.”',
      'That evening we shared dinner with family. Uncle Mohammed prepared incredible burgers. The children became waiters, walking around with menus, taking everyone’s orders — the whole evening felt like a restaurant built entirely from love.',
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
