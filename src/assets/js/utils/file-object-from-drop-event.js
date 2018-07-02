export default function fileObjectFromDropEvent ({event, typeStartsWith = 'audio/'}) {
    const ev = event;
    let result = [];

    if (ev.dataTransfer && ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let ind = 0; ind < ev.dataTransfer.items.length; ind++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[ind].kind === 'file' && ev.dataTransfer.items[ind].type.startsWith(typeStartsWith)) {
                result.push(ev.dataTransfer.items[ind].getAsFile());
            }
        }
    } else if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
        // Use DataTransfer interface to access the file(s)
        for (let ind = 0; ind < ev.dataTransfer.files.length; ind++) {
            result.push(ev.dataTransfer.files[ind]);
        }
        result = result.filter(item => item.type.startsWith(typeStartsWith));
    }

    return result;
};