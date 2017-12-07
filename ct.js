(function() {
    const sheet = document.createElement('style')
    sheet.innerHTML = ".hinter-selected {color: gray; cursor: help; font-weight: bold; text-decoration: underline;}";
    document.body.appendChild(sheet);

    const dictionary = (window.getDictionary || (() => ({})))();

    const buildBranch = (word) => {
        const letters = word.split('').reverse();
        let node = {};
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            node = {
                [letter]: node,
            };
            if (i === 0) {
                node.end = true;
            }
        }
        return node;
    }

    const buildTree = () => {
        let tree = {};
        for (let word of Object.keys(dictionary)) {
            let branch = tree;
            for (let i = 0; i < word.length; i++) {
                const letter = word[i];
                if (branch[letter]) {
                    branch = branch[letter];
                    if (i === word.length - 1) {
                        branch.end = true;
                    }
                } else {
                    const rest = word.slice(i + 1, word.length);
                    branch[letter] = buildBranch(rest);
                    break;
                }
            }
        }
        return tree;
    };

    const replaceTextNode = ([beforeText, hintText, afterText], parent, node) => {
        const before = document.createElement('text');
        before.textContent = beforeText;
        parent.insertBefore(before, node);
        const hint = document.createElement('span');
        hint.setAttribute('class', 'hinter-selected');
        hint.textContent = hintText;
        hint.setAttribute('title', dictionary[hintText]);
        parent.insertBefore(hint, node);
        node.textContent = afterText;
    }

    const tree = buildTree();

    const holders = [
        ...document.querySelectorAll('p'),
        ...document.querySelectorAll('span'),
    ];

    const searchInText = (node) => {
        const textNodes = [...node.childNodes].filter(e => e.nodeName === '#text');
        textNodes.forEach(textNode => {
            const content = textNode.textContent;
            let start = 0;
            let matchStart = null;
            let matchEnd = null;
            let branch = tree;
            for (let i = 0; i < content.length; i++) {
                const letter = content[i];
                if (branch[letter]) {
                    // continue positive match
                    if (!matchStart) {
                        matchStart = i;
                    }
                    if (branch.end) {
                        matchEnd = i + 1;
                    }
                    branch = branch[letter];
                } else if (branch !== tree) {
                    if (matchStart !== null && matchEnd !== null) {
                        const beforeText = content.slice(start, matchStart);
                        const hintText = content.slice(matchStart, matchEnd);
                        const afterText = content.slice(matchEnd, content.length);
                        replaceTextNode([beforeText, hintText, afterText], node, textNode);
                    }
                    // return to the root
                    matchStart = null;
                    matchEnd = null;
                    i--;
                    branch = tree;
                } else {
                    // start new attempt
                }
            }
        });
    }

    holders.forEach(searchInText);


})()
