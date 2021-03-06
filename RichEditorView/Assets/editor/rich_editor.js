/**
 * Copyright (C) 2015 Wasabeef
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.onload = function() {
    RE.callback("ready");
};

var RE = {};

RE.currentSelection;

RE.editor = document.getElementById('editor');
RE.body = document.getElementsByTagName('body')[0];

// Not universally supported, but seems to work in iOS 7 and 8
document.addEventListener("selectionchange", function() { RE.backuprange(); });

//looks specifically for a Range selection and not a Caret selection
RE.rangeSelectionExists = function() {
    //!! coerces a null to bool
    var sel = document.getSelection();
    if (sel && sel.type == "Range") {
        return true;
    }
    return false;
};

RE.editor.addEventListener("input", function() {
    RE.updatePlaceholder();
    RE.backuprange();
    RE.callback("input");
});

RE.editor.addEventListener("focus", function() {
    RE.backuprange();
    RE.callback("focus");
});

RE.editor.addEventListener("blur", function() {
    RE.callback("blur");
});

RE.customAction = function(action) {
    RE.callback("action/" + action);
}

RE.callbackQueue = [];
RE.runCallbackQueue = function() {
    if (RE.callbackQueue.length == 0) {
        return;
    }
    
    setTimeout(function() {
        window.location.href = "re-callback://";    
    }, 0);
}

RE.getCommandQueue = function() {
    var commands = JSON.stringify(RE.callbackQueue);
    RE.callbackQueue = [];
    return commands;
}

RE.callback = function(method) {
    RE.callbackQueue.push(method);
    RE.runCallbackQueue();
}

RE.setHtml = function(contents) {
    RE.editor.innerHTML = contents;
    RE.updatePlaceholder();
}

RE.getHtml = function() {
    return RE.editor.innerHTML;
}

RE.getText = function() {
    return RE.editor.innerText;
}

RE.setPlaceholderText = function(text) {
    RE.editor.setAttribute("placeholder", text);
}

RE.updatePlaceholder = function() {
    if (RE.editor.textContent.length > 0) {
        RE.editor.classList.remove("placeholder");
    } else {
        RE.editor.classList.add("placeholder");
    }
}

RE.removeFormat = function() {
    document.execCommand('removeFormat', false, null);
}

RE.setFontSize = function(size) {
    RE.editor.style.fontSize = size;
}

RE.setFontColor = function(color) {
    RE.editor.style.color = color;
}

RE.setBackgroundColor = function(color) {
    RE.body.style.backgroundColor = color;
}

RE.setEditorPadding = function(top, right, bottom, left) {
    RE.editor.style.padding = top + "px " + right + "px " + bottom + "px " + left + "px";
};

RE.setHeight = function(size) {
    RE.editor.style.height = size;
}

RE.undo = function() {
    document.execCommand('undo', false, null);
}

RE.redo = function() {
    document.execCommand('redo', false, null);
}

RE.setBold = function() {
    document.execCommand('bold', false, null);
}

RE.setItalic = function() {
    document.execCommand('italic', false, null);
}

RE.setSubscript = function() {
    document.execCommand('subscript', false, null);
}

RE.setSuperscript = function() {
    document.execCommand('superscript', false, null);
}

RE.setStrikeThrough = function() {
    document.execCommand('strikeThrough', false, null);
}

RE.setUnderline = function() {
    document.execCommand('underline', false, null);
}

RE.setTextColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

RE.setTextBackgroundColor = function(color) {
    RE.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('hiliteColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

RE.setHeading = function(heading) {
    document.execCommand('formatBlock', false, '<h'+heading+'>');
}

RE.setIndent = function() {
    document.execCommand('indent', false, null);
}

RE.setOutdent = function() {
    document.execCommand('outdent', false, null);
}

RE.setOrderedList = function() {
    document.execCommand('insertOrderedList', false, null);
}

RE.setUnorderedList = function() {
    document.execCommand('insertUnorderedList', false, null);
}

RE.setJustifyLeft = function() {
    document.execCommand('justifyLeft', false, null);
}

RE.setJustifyCenter = function() {
    document.execCommand('justifyCenter', false, null);
}

RE.setJustifyRight = function() {
    document.execCommand('justifyRight', false, null);
}

RE.isItalic = function() {
    return document.queryCommandState("Italic");
}

RE.isBold = function() {
    return document.queryCommandState("Bold");
}

RE.isBlockquote = function() {
    
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0)
        var node = range.startContainer;
		
		return parentBlockquoteNode(node) != null;
    }
    
    return false
}

RE.isUndoAvailable = function() {
    return document.queryCommandEnabled('undo');
}

RE.isRedoAvailable = function() {
    return document.queryCommandEnabled('redo');
}

RE.insertImage = function(url, alt) {
    var html = '<img src="' + url + '" alt="' + alt + '" />';
    RE.insertHTML(html);
    RE.callback("input");
}

RE.setBlockquote = function() {   
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var node = selection.getRangeAt(0).startContainer;
        
        if (parentBlockquoteNode(node) != null) {
            document.execCommand('outdent', false, null);
        } else {
            document.execCommand('formatBlock', false, '<blockquote>');
        }
    } else {
        document.execCommand('formatBlock', false, '<blockquote>');
    }
}

function parentBlockquoteNode(x) {
    do {
        if (x.nodeName === "BLOCKQUOTE") return x
    }
    while (x = x.parentElement);
    
    return null;
}

RE.editor.onkeydown = function(e) {
    if (e.keyCode == 13) { /* enter key */
        
        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            var range = selection.getRangeAt(0)
            var node = range.startContainer;
            
            var blockquote = parentBlockquoteNode(node);
            
            if (blockquote != null) {
                
                if (node.innerHTML === "<br>") {
                    /* this is an empty line within a blockquote - break out of blockquote on return */
                    
                    document.execCommand('insertHTML', false, "<br>");
                    document.execCommand('outdent', false, null);
                } else {
                    
                    var hasPContainer = false;
                    
                    var n = node;
                    do {
                        if (n.nodeName === "BLOCKQUOTE") {
                            break;
                        } else if (n.nodeName === "P") {
                            hasPContainer = true;
                        }
                    } while (n = n.parentElement);
                    
                    if (!hasPContainer) {
                        /* put the blockquote content within a p */
                        var htmlC = blockquote.innerHTML;
                        blockquote.innerHTML = "<p>" + htmlC + "</p>";
                    }
                    
                    /* create a new paragraph with a br in it */
                    var p = document.createElement("p")
                    
                    blockquote.appendChild(p);
                    
                    var br = document.createElement("br")
                    p.appendChild(br);
                    
                    range.collapse();
                    range.setStartAfter(br)
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                
                return false
            }
        }
    }
}

RE.insertHTML = function(html) {
    RE.restorerange();
    document.execCommand('insertHTML', false, html);
}

RE.insertLink = function(url, title) {
    RE.restorerange();
    
    var sel = document.getSelection();
    if (sel.toString().length !== 0 && sel.rangeCount) {
        var el = document.createElement("a");
        el.setAttribute("href", url);
        el.setAttribute("title", title);
        
        var range = sel.getRangeAt(0).cloneRange();
        range.surroundContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        var html = '<a href="' + url + '">' + title + '</a>';
        RE.insertHTML(html);
    }
    RE.callback("input");
}

RE.prepareInsert = function() {
    RE.backuprange();
}

RE.backuprange = function(){
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        RE.currentSelection = {
            "startContainer": range.startContainer,
            "startOffset": range.startOffset,
            "endContainer": range.endContainer,
            "endOffset": range.endOffset};
    }
}

RE.restorerange = function(){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(RE.currentSelection.startContainer, RE.currentSelection.startOffset);
    range.setEnd(RE.currentSelection.endContainer, RE.currentSelection.endOffset);
    selection.addRange(range);
}

RE.getSelectedText = function(){
    return document.getSelection().toString();
}

RE.focus = function() {
    var range = document.createRange();
    range.selectNodeContents(RE.editor);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    RE.editor.focus();
}

RE.blurFocus = function() {
    RE.editor.blur();
}
