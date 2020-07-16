const { ipcRenderer } = require('electron');
ipcRenderer.on('loadFile', (e,msg) => {
    let { fileName, fileContent } = msg;
    document.title = fileName;
    document.getElementById('editor').value = fileContent;
});
ipcRenderer.on('clear-all', () => {
    document.title = "Document";
    document.getElementById('editor').value = "";
});
ipcRenderer.on('getText', (e) => {
    text = document.getElementById('editor').value;
    ipcRenderer.send('rgetText',text);
});

function search(text) {
    editor = document.getElementById('editor');
    val = editor.value;
    start = val.indexOf(text);
    end = start+text.length;
    editor.setSelectionRange(start,end);  
}

function replace(text,rtext) {
    editor = document.getElementById('editor');
    val = editor.value;
    val = val.replace(text,rtext);
    editor.value = val;  
}
document.getElementById('editor').addEventListener('keypress', (e) => {
    if (e.which == 9) {
        e.preventDefault();
        if (e.target === document.activeElement) {
            document.execCommand('insertText', false, '&#009;');
        }
    }
})