const filePicker = document.getElementById('file-picker');
const fileRemover = document.getElementById('remove-file');
const curFile = document.getElementById('file-label');

filePicker.addEventListener('change', fileUpdate)
fileRemover.addEventListener('click', removeFile)

function fileUpdate() {
    curFile.style.display = 'none';
    filePicker.style.display = 'block';
}

function removeFile() {
    curFile.style.display = 'none';
    filePicker.style.display = 'block';
}