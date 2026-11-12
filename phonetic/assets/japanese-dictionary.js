(function () {
    'use strict';

    const data = window.PhoneticJapaneseEntries;
    const article = /^(a|an|the|this|that|my|your|his|her|our|their|its)$/;
    const subject = /^(i|you|he|she|it|we|they|who|nobody|someone|everyone)$/;
    const have = /^(have|has|had|having|i've|we've|you've|they've)$/;
    const be = /^(am|is|are|was|were|been|be|being|i'm|we're|they're|you're)$/;

    function normalize(word) {
        return word.normalize('NFKC').trim().replace(/[‘’ʼ]/g, "'").replace(/[‐‑–]/g, '-');
    }

    // Each bucket covers the first two letters. A lookup reads just the matched row.
    function row(groups, key) {
        const bucket = key.slice(0, 2).toLowerCase();
        if (!Object.hasOwn(groups, bucket)) return null;
        const group = groups[bucket];
        const marker = '\n' + key + '\t';
        const index = group.indexOf(marker);
        if (index === -1) return null;
        const start = index + marker.length;
        return group.slice(start, group.indexOf('\n', start));
    }

    function exact(word) {
        const record = row(data.definitions, word);
        if (record === null) return null;
        const boundary = record.indexOf('\t');
        return {headword: record.slice(0, boundary) || word, meaning: record.slice(boundary + 1)};
    }

    // A capital at the beginning of a sentence often coincides with an abbreviation (Can, Be).
    const lowercaseAtStart = new Set(
        'a an the am are as at be but by can do for from had has have he her here how i if in is it may me no of on or our she so than that their them there these they this those to us we what when where which who why will with you your'.split(' ')
    );

    function literal(raw, lower, next) {
        if (raw === 'A' && next && !/^(is|was|stands)$/.test(next)) return exact('a');
        if (raw !== lower) {
            const titling = /^[A-Z][a-z]+$/.test(raw);
            const month = raw === 'May' && !subject.test(next);
            if (!titling || !lowercaseAtStart.has(lower) || month) {
                const specific = exact(raw);
                if (specific) return specific;
            }
        }
        return exact(lower);
    }

    const contractions = new Map([
        ["ain't", ['am not / is not / are not', '～ではない、～していない（くだけた表現）。have not / has not にも相当する']],
        ["aren't", ['are not', '～ではない、～していない']],
        ["can't", ['cannot', '～できない、～のはずがない']],
        ["couldn't", ['could not', '～できなかった、～のはずがない']],
        ["didn't", ['did not', '～しなかった']], ["doesn't", ['does not', '～しない']],
        ["don't", ['do not', '～しない、～しないで']],
        ["hadn't", ['had not', '（その時までに）～していなかった']],
        ["hasn't", ['has not', 'まだ～していない']], ["haven't", ['have not', 'まだ～していない']],
        ["isn't", ['is not', '～ではない、～していない']],
        ["mustn't", ['must not', '～してはいけない']], ["needn't", ['need not', '～する必要はない']],
        ["wasn't", ['was not', '～ではなかった、～していなかった']],
        ["weren't", ['were not', '～ではなかった、～していなかった']],
        ["shan't", ['shall not', '～しないつもりだ']], ["shouldn't", ['should not', '～すべきではない']],
        ["won't", ['will not', '～しないだろう、～するつもりはない']],
        ["wouldn't", ['would not', '～しないだろう、どうしても～しなかった']],
        ["mightn't", ['might not', '～しないかもしれない']],
        ["oughtn't", ['ought not', '～すべきではない']],
        ["let's", ['let us', '～しよう、～しましょう']],
        ["that's", ['that is / that has', 'それは～です、または「それはすでに～した」']],
        ["there's", ['there is / there has', '～がある、～がいる。there has の短縮形でもある']],
        ["here's", ['here is', 'ここに～がある、こちらが～です']],
        ["what's", ['what is / what has', '何が～か、～は何か']],
        ["who's", ['who is / who has', 'だれが～か、だれが～したか']],
        ["where's", ['where is / where has', '～はどこか、どこに～したか']],
        ["how's", ['how is / how has', '～はどうですか、どのように～しましたか']],
        ["would've", ['would have', '～していただろう']], ["could've", ['could have', '～できたかもしれない']],
        ["should've", ['should have', '～すべきだった']], ["might've", ['might have', '～したかもしれない']],
        ["must've", ['must have', '～したにちがいない']], ["y'all", ['you all', 'あなたたち、みんな（口語）']]
    ]);
    const pronouns = new Map(Object.entries({
        i: '私', you: 'あなた', he: '彼', she: '彼女', it: 'それ', we: '私たち', they: '彼ら・それら'
    }));

    function contraction(word) {
        const fixed = contractions.get(word);
        if (fixed) return {headword: fixed[0], meaning: fixed[1]};
        const match = /^(i|you|he|she|it|we|they)'(m|re|s|ll|ve|d)$/.exec(word);
        if (!match) return null;
        const person = match[1] === 'i' ? 'I' : match[1];
        const topic = pronouns.get(match[1]) + 'は';
        const ending = match[2];
        if (ending === 'm' && person === 'I') return {headword: 'I am', meaning: '私は～です、私は～しています'};
        if (ending === 're' && /^(you|we|they)$/.test(person)) return {headword: person + ' are', meaning: topic + '～です、～しています'};
        if (ending === 's' && /^(he|she|it)$/.test(person)) return {headword: person + ' is / ' + person + ' has', meaning: topic + '～です、～しています。または「すでに～した」'};
        if (ending === 've' && /^(I|you|we|they)$/.test(person)) return {headword: person + ' have', meaning: topic + '～したことがある、すでに～した'};
        if (ending === 'll') return {headword: person + ' will', meaning: topic + '～するつもりだ、～するだろう'};
        if (ending === 'd') return {headword: person + ' would / ' + person + ' had', meaning: topic + '～するだろう、または「すでに～していた」'};
        return null;
    }

    const lexicalized = new Set(
        'according amazing amusing annoying bearing bedding being binding blessing boring building calling ceiling clothing concerned confused confusing covering darling drawing during dwelling earnings exciting experienced feeling following frightened frustrating furniture greeting heading interesting interested lining living meaning meeting morning moving opening outstanding painting parking pleasing pudding reading regarding retired ruling saving setting shooting shopping spring sterling striking stunning suffering surrounding surprising tired training understanding unexpected used wedding willing wonderful working writing'.split(' ')
    );
    const ordinaryParticiples = new Set(
        'doing going learning listening reading speaking sleeping swimming taking trying waiting walking working writing'.split(' ')
    );
    const beForms = new Set('am is are was were been being'.split(' '));

    function knownWord(raw, previous, next) {
        const lower = raw.toLowerCase();
        const fixed = contraction(lower);
        if (fixed) return fixed;
        const match = literal(raw, lower, next);
        if (match && /[A-Z]/.test(raw) && match.headword === raw && raw !== 'I') return match;
        if (beForms.has(lower)) return exact('be');

        // These spellings have common, unrelated senses: use local context only for strong cues.
        if (lower === 'saw') {
            if (article.test(previous) || /^(to|can|could|must|should|will|would)$/.test(previous)) return exact('saw');
            if (subject.test(previous)) return exact('see');
            return {headword: 'see', meaning: '見る（saw は過去形）。名詞では「のこぎり」、別の動詞では「のこぎりで切る」'};
        }
        if (lower === 'left') {
            if (subject.test(previous) || have.test(previous)) return exact('leave');
            return {headword: 'left', meaning: '左、左の、左に。または leave（去る、残す）の過去形・過去分詞'};
        }
        if (lower === 'lives' || lower === 'leaves') {
            const verb = lower === 'lives' ? 'live' : 'leave';
            const noun = lower === 'lives' ? 'life' : 'leaf';
            if (subject.test(previous) || (lower === 'lives' && /^(in|near|with|at)$/.test(next))) return exact(verb);
            if (article.test(previous) || /^(our|their|many|several)$/.test(previous)) return exact(noun);
            return {headword: noun, meaning: lower === 'lives' ? '命、人生（life の複数形）。または live（住む、生きる）の三人称単数形' : '葉（leaf の複数形）。または leave（去る、残す）の三人称単数形'};
        }

        const forms = row(data.inflections, lower);
        if (forms) {
            const lemmas = forms.split('|');
            const verbal = (be.test(previous) && lower.endsWith('ing')) || have.test(previous);
            const commonForm = /(?:ed|ing)$/.test(lower) && (!lexicalized.has(lower) || ordinaryParticiples.has(lower));
            // Keep an independent dictionary entry for ambiguous forms unless the context is clear.
            if (lemmas.length === 1 && (!match || verbal || commonForm)) {
                const lemma = exact(lemmas[0]);
                if (lemma) return lemma;
            }
            if (!match && lemmas.length > 1) {
                const options = lemmas.map(exact).filter(Boolean).slice(0, 2);
                if (options.length) return {headword: options.map(option=>option.headword).join(' / '), meaning: options.map(option=>option.headword + '（' + option.meaning + '）').join(' ／ ')};
            }
        }
        return match;
    }

    function lookup(word, context) {
        if (typeof word !== 'string' || word.length > 160) return null;
        const raw = normalize(word);
        if (!raw || !/^[\p{Script=Latin}\p{M}0-9'. -]+$/u.test(raw)) return null;
        const previous = typeof context?.previous === 'string' ? normalize(context.previous).toLowerCase() : '';
        const next = typeof context?.next === 'string' ? normalize(context.next).toLowerCase() : '';
        const wordMatch = knownWord(raw, previous, next);
        if (wordMatch) return wordMatch;
        if (/'s$|s'$/i.test(raw)) {
            const stem = raw.replace(/'s$|'$/i,'');
            const base = knownWord(stem, previous, next);
            if (base) return {headword: base.headword, meaning: base.meaning + '（所有形では「～の」）'};
        }
        const plain = raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        return plain !== raw ? knownWord(plain, previous, next) : null;
    }

    window.PhoneticJapanese = Object.freeze({lookup, size: data.entryCount, forms: data.formCount});
}());
