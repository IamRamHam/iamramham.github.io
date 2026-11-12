(() => {
  // The times point into the discussion of each sound in the original video.
  const vowels = [
    {
      id: "ae", symbol: "æ", group: "アに近い母音", readingSeconds: 80,
      word: "hat", ipa: "hæt", highlight: "a",
      tips: [
        "「エ」の口からあごを下げ、舌は前のほうに置きます。",
        "その形のまま、ひと息で明るい「ア」を響かせます。"
      ]
    },
    {
      id: "aa", symbol: "ɑ", group: "アに近い母音", readingSeconds: 120,
      word: "shot", ipa: "ʃɑt", highlight: "o",
      tips: [
        "あくびをするときのように、あごを大きく下げます。",
        "唇をゆるめ、舌を低く奥に置いたまま声を出します。"
      ]
    },
    {
      id: "ao", symbol: "ɔ", group: "オに近い母音", readingSeconds: 160,
      word: "law", ipa: "lɔ", highlight: "aw",
      tips: [
        "「オ」の形からあごをもう少し開き、唇は軽く丸めます。",
        "米国には law の母音を /ɑ/ と同じ音で発音する地域もあります。"
      ]
    },
    {
      id: "ax", symbol: "ə", group: "アに近い母音", readingSeconds: 200,
      word: "about", ipa: "əˈbaʊt", highlight: "a",
      tips: [
        "あごも唇も楽な位置に置き、ごく短く声を出します。",
        "about の初めの a を軽く通り過ぎ、後半の bout に強さを置きます。"
      ]
    },
    {
      id: "ah", symbol: "ʌ", group: "アに近い母音", readingSeconds: 240,
      word: "up", ipa: "ʌp", highlight: "u",
      tips: [
        "あごを少し開き、口の中央で「ア」と声を出します。",
        "up の u に強さを置くと、about の弱い /ə/ と比べられます。"
      ]
    },
    {
      id: "er", symbol: "ɝ", group: "Rを含む母音", readingSeconds: 270,
      word: "work", ipa: "wɝk", highlight: "or",
      tips: [
        "舌の中央を盛り上げるか、舌先を軽く後ろへ向けて声を出します。",
        "work では、母音の出だしから終わりまで R の響きを保ちます。"
      ]
    },
    {
      id: "ih", symbol: "ɪ", group: "イに近い母音", readingSeconds: 320,
      word: "ship", ipa: "ʃɪp", highlight: "i",
      tips: [
        "「イ」から舌を少し下げ、唇とあごの力をゆるめます。",
        "ship の i を軽く出し、そのまま両唇を閉じて /p/ へ移ります。"
      ]
    },
    {
      id: "iy", symbol: "i", group: "イに近い母音", readingSeconds: 360,
      word: "sheep", ipa: "ʃip", highlight: "ee",
      tips: [
        "口角を少し横に引き、舌の前のほうを高くします。",
        "ship と sheep を続けて言い、後者で口の開きを小さくしてみましょう。"
      ]
    },
    {
      id: "uh", symbol: "ʊ", group: "ウに近い母音", readingSeconds: 400,
      word: "book", ipa: "bʊk", highlight: "oo",
      tips: [
        "唇をゆるく丸め、「オ」が少し混じるような軽い「ウ」を出します。",
        "book では、短い母音からすぐに奥舌を上げて /k/ を作ります。"
      ]
    },
    {
      id: "uw", symbol: "u", group: "ウに近い母音", readingSeconds: 440,
      word: "goose", ipa: "ɡus", highlight: "oo",
      tips: [
        "舌を高く上げて口の開きを小さくし、唇を丸めます。",
        "goose の oo でその構えを保ち、最後に /s/ の息を出します。"
      ]
    },
    {
      id: "eh", symbol: "ɛ", group: "エに近い母音", readingSeconds: 480,
      word: "bed", ipa: "bɛd", highlight: "e",
      tips: [
        "舌を前に置き、日本語の「エ」からあごを少しゆるめます。",
        "bed の母音を同じ音色に保ち、舌先で最後の /d/ を作ります。"
      ]
    },
    {
      id: "ay", symbol: "aɪ", group: "二重母音", readingSeconds: 520,
      word: "light", ipa: "laɪt", highlight: "igh",
      tips: [
        "口を開いた「ア」から始め、舌の前のほうを「イ」の方向へ上げます。",
        "最初の音に重みを置き、ひとつの音節の中でなめらかに移ります。"
      ]
    },
    {
      id: "aw", symbol: "aʊ", group: "二重母音", readingSeconds: 550,
      word: "cloud", ipa: "klaʊd", highlight: "ou",
      tips: [
        "あごを下げて「ア」を出した後、声を保ったまま唇を丸めます。",
        "cloud の ou が一拍に収まるように、終わりの「ウ」を軽くします。"
      ]
    },
    {
      id: "ey", symbol: "eɪ", group: "二重母音", readingSeconds: 570,
      word: "say", ipa: "seɪ", highlight: "ay",
      tips: [
        "「エ」から舌を少し持ち上げ、口が狭くなるにつれて「イ」に近づけます。",
        "say の最後まで声をつなげ、母音の終わりの変化を聞き取りましょう。"
      ]
    },
    {
      id: "oy", symbol: "ɔɪ", group: "二重母音", readingSeconds: 600,
      word: "boy", ipa: "bɔɪ", highlight: "oy",
      tips: [
        "唇を丸めて「オ」と声を出し、丸みをほどきながら舌を前に動かします。",
        "boy の最後で「イ」に近づいたら、そのまま声を止めます。"
      ]
    },
    {
      id: "ow", symbol: "oʊ", group: "二重母音", readingSeconds: 630,
      word: "boat", ipa: "boʊt", highlight: "oa",
      tips: [
        "「オ」と響かせたまま、終わりで少しあごを上げて唇をすぼめます。",
        "boat の oa で口の形が動いているか、鏡で確かめてみましょう。"
      ]
    }
  ];

  const consonants = [
    {
      id: "p", symbol: "p", group: "破裂音", voicing: "無声音", readingSeconds: 760,
      word: "pan", ipa: "pæn", highlight: "p",
      tips: [
        "両唇を軽く閉じて息をため、ぱっと開きます。",
        "pan の出だしを手のひらに向けて言うと、ひと吹きの息を感じられます。"
      ]
    },
    {
      id: "b", symbol: "b", group: "破裂音", voicing: "有声音", readingSeconds: 770,
      word: "born", ipa: "bɔrn", highlight: "b",
      tips: [
        "両唇で息を止めてから開く動きは /p/ と共通です。",
        "born では唇を離すと同時に声を立ち上げ、次の母音へつなげます。"
      ]
    },
    {
      id: "t", symbol: "t", group: "破裂音", voicing: "無声音", readingSeconds: 810,
      word: "top", ipa: "tɑp", highlight: "t",
      tips: [
        "舌先を上の前歯のすぐ奥のふくらみにつけて、息をせき止めます。",
        "top の最初で舌をすばやく離し、たまった息を前へ出します。"
      ]
    },
    {
      id: "d", symbol: "d", group: "破裂音", voicing: "有声音", readingSeconds: 820,
      word: "down", ipa: "daʊn", highlight: "d",
      tips: [
        "舌先を /t/ と同じ、上の前歯のすぐ奥につけます。",
        "down の最初で舌を離し、息を強く吹く力を抜いて声へ移ります。"
      ]
    },
    {
      id: "k", symbol: "k", group: "破裂音", voicing: "無声音", readingSeconds: 860,
      word: "key", ipa: "ki", highlight: "k",
      tips: [
        "舌の奥を上あごの柔らかい部分に当て、空気の通り道を閉じます。",
        "舌を離した瞬間に息が抜ける感触を、key の最初で確かめます。"
      ]
    },
    {
      id: "g", symbol: "ɡ", group: "破裂音", voicing: "有声音", readingSeconds: 870,
      word: "get", ipa: "ɡɛt", highlight: "g",
      tips: [
        "舌の奥で上あごに触れ、一瞬だけ息を止めます。",
        "get の最初でそこを開き、声の響きをそのまま /ɛ/ にのせます。"
      ]
    },
    {
      id: "f", symbol: "f", group: "摩擦音", voicing: "無声音", readingSeconds: 900,
      word: "fly", ipa: "flaɪ", highlight: "f",
      tips: [
        "上の前歯を下唇の内側にそっと当てます。",
        "その細いすき間に息を通し、fly の f を少し長く出してみましょう。"
      ]
    },
    {
      id: "v", symbol: "v", group: "摩擦音", voicing: "有声音", readingSeconds: 910,
      word: "view", ipa: "vju", highlight: "v",
      tips: [
        "上の前歯と下唇を軽く触れ合わせて、/f/ と同じすき間を作ります。",
        "そこへ息と声を通し、下唇に細かい振動を感じながら view と言います。"
      ]
    },
    {
      id: "th", symbol: "θ", group: "摩擦音", voicing: "無声音", readingSeconds: 980,
      word: "bath", ipa: "bæθ", highlight: "th",
      tips: [
        "舌先を上下の前歯の間に少し出し、歯は軽く触れる程度にします。",
        "bath の語尾で舌と歯の間に息だけを通し、静かな摩擦を続けます。"
      ]
    },
    {
      id: "dh", symbol: "ð", group: "摩擦音", voicing: "有声音", readingSeconds: 990,
      word: "that", ipa: "ðæt", highlight: "th",
      tips: [
        "舌先を前歯の間に少し出し、/θ/ と同じ細いすき間を作ります。",
        "今度は息に声ものせます。that の出だしでのどに触れると振動を感じます。"
      ]
    },
    {
      id: "s", symbol: "s", group: "摩擦音", voicing: "無声音", readingSeconds: 1070,
      word: "slow", ipa: "sloʊ", highlight: "s",
      tips: [
        "上下の歯を近づけ、舌の前のほうと歯ぐきの間に細い溝を残します。",
        "slow の s で、その溝から前歯に向けて細く息を出し続けます。"
      ]
    },
    {
      id: "z", symbol: "z", group: "摩擦音", voicing: "有声音", readingSeconds: 1080,
      word: "zoo", ipa: "zu", highlight: "z",
      tips: [
        "/s/ の口の形のまま、細く流す息に声を加えます。",
        "zoo の冒頭を伸ばし、のどの振動と摩擦音が同時に続くのを感じます。"
      ]
    },
    {
      id: "sh", symbol: "ʃ", group: "摩擦音", voicing: "無声音", readingSeconds: 1110,
      word: "brush", ipa: "brʌʃ", highlight: "sh",
      tips: [
        "/s/ の位置から舌を少し後ろへ引き、舌の前のほうを持ち上げます。",
        "唇をわずかに丸め、brush の終わりで息のこすれる音を続けます。"
      ]
    },
    {
      id: "zh", symbol: "ʒ", group: "摩擦音", voicing: "有声音", readingSeconds: 1110,
      word: "vision", ipa: "ˈvɪʒən", highlight: "s",
      tips: [
        "/ʃ/ と同じ位置に舌を構え、息をこすらせながら声を重ねます。",
        "vision の真ん中で摩擦を少し長く保ち、次の弱い /ə/ につなげます。"
      ]
    },
    {
      id: "ch", symbol: "tʃ", group: "破擦音", voicing: "無声音", readingSeconds: 1180,
      word: "charge", ipa: "tʃɑrdʒ", highlight: "ch",
      tips: [
        "舌の前のほうで上あごに触れて息を止め、すぐに細いすき間を開きます。",
        "charge の ch は、息が弾けてからこすれるまでをひと続きにします。"
      ]
    },
    {
      id: "jh", symbol: "dʒ", group: "破擦音", voicing: "有声音", readingSeconds: 1190,
      word: "age", ipa: "eɪdʒ", highlight: "ge",
      tips: [
        "舌の前のほうで息を止め、/tʃ/ と同じ位置から声を伴って開きます。",
        "age の語尾では、舌が離れるときの短い摩擦で単語を終えます。"
      ]
    },
    {
      id: "l", symbol: "l", group: "流音", voicing: "有声音", readingSeconds: 1270,
      word: "like", ipa: "laɪk", highlight: "l",
      tips: [
        "like の L は、舌先を上の前歯のすぐ奥に当て、舌の横に息を通します。",
        "cool の語尾では舌の奥も上がり、こもった L の響きになります。"
      ]
    },
    {
      id: "r", symbol: "r", group: "流音", voicing: "有声音", readingSeconds: 1400,
      word: "right", ipa: "raɪt", highlight: "r",
      tips: [
        "舌先を軽く反らすか、舌の中央を奥で盛り上げて声を出します。",
        "right では舌先と上あごの間を空けたまま、次の母音へ滑らせます。"
      ]
    },
    {
      id: "m", symbol: "m", group: "鼻音", voicing: "有声音", readingSeconds: 1490,
      word: "man", ipa: "mæn", highlight: "m",
      tips: [
        "両唇をそっと閉じ、声を鼻のほうへ響かせます。",
        "man の最初で響きを保ったまま唇を開いて、/æ/ に移ります。"
      ]
    },
    {
      id: "n", symbol: "n", group: "鼻音", voicing: "有声音", readingSeconds: 1530,
      word: "nose", ipa: "noʊz", highlight: "n",
      tips: [
        "口を少し開き、舌先を上の前歯のすぐ奥に当てて鼻から息を出します。",
        "nose の n を伸ばしてから、舌先を離して母音を響かせます。"
      ]
    },
    {
      id: "ng", symbol: "ŋ", group: "鼻音", voicing: "有声音", readingSeconds: 1610,
      word: "sing", ipa: "sɪŋ", highlight: "ng",
      tips: [
        "舌先を休め、舌の奥を上あごにつけて息を鼻へ通します。",
        "sing の最後は、その位置で響きを止めれば ng の発音が完成します。"
      ]
    },
    {
      id: "h", symbol: "h", group: "摩擦音", voicing: "無声音", readingSeconds: 1630,
      word: "help", ipa: "hɛlp", highlight: "h",
      tips: [
        "次に来る母音の口を先に作り、のどから息をそっと流します。",
        "help は /ɛ/ の口の形で息を出し始め、その息に声を加えます。"
      ]
    },
    {
      id: "y", symbol: "j", group: "半母音", voicing: "有声音", readingSeconds: 1670,
      word: "yellow", ipa: "ˈjɛloʊ", highlight: "y",
      tips: [
        "「イ」の構えで舌の前のほうを上あごに近づけ、すぐ次の母音へ動きます。",
        "yellow は舌を下げながら、ひと息で最初の /jɛ/ を出します。"
      ]
    },
    {
      id: "w", symbol: "w", group: "半母音", voicing: "有声音", readingSeconds: 1720,
      word: "way", ipa: "weɪ", highlight: "w",
      tips: [
        "唇を小さく丸めて少し突き出し、舌の奥を持ち上げます。",
        "way の出だしで声を出しながら、すぐに唇を開いて /eɪ/ に移ります。"
      ]
    }
  ];

  window.PHONETIC_LESSON = {
    source: {
      author: "Atsueigo",
      title: "【永久保存版】たった30分で発音記号を完全攻略【速習まとめ】",
      url: "https://www.youtube.com/watch?v=Qe3EmiFWgGM",
      guideUrl: "https://knowledge.atsueigo.com/phonetics-basics/",
      durationSeconds: 1868
    },
    notation: "米国英語の表記です。動画の bed の /e/ はここでは /ɛ/、work の母音と R の組み合わせは /ɝ/ と書きます。sister の弱い語尾は /ɚ/ です。ˈ は主強勢、ˌ は副強勢を示します。",
    chapters: [
      { title: "ア・オに近い母音と R の響き", seconds: 70 },
      { title: "イ・ウ・エに近い母音", seconds: 300 },
      { title: "二重母音", seconds: 500 },
      { title: "子音と有声・無声のペア", seconds: 690 },
      { title: "L と R の舌の位置", seconds: 1240 },
      { title: "鼻から息を通す音", seconds: 1450 },
      { title: "H・Y・W の発音", seconds: 1630 }
    ],
    sounds: [
      ...vowels.map(sound => ({ ...sound, kind: "vowel", tags: ["母音", sound.group] })),
      ...consonants.map(sound => ({ ...sound, kind: "consonant", tags: ["子音", sound.group, sound.voicing] }))
    ]
  };
})();
