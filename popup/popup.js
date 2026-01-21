const button = document.getElementById("button");
const checkbox = document.getElementById("checkbox");
const last_exercise = document.getElementById("last_exercise");
const information = document.getElementById("information");

button.addEventListener("click",() => { 
    chrome.tabs.query({active: true}, (tabs) => {
        const tab = tabs[0];
        if (tab) {
            const url = new URL(tab.url);
            const urlParams = url.searchParams;
            if(!last_exercise.value.trim()){
                last_exercise.focus();
                setTimeout(() => {
                    alert("Введите номер задания, до которого нужно скопировать");
                }, 0);
                return;
            }
            if (url.origin === 'https://www.yaklass.ru' &&
                url.pathname === '/TestWorkRun/Exercise' &&
                urlParams.has('testResultId') && 
                urlParams.has('exercisePosition') && 
                urlParams.has('twId')){

                const twId = urlParams.get('twId');
                const testResultId = urlParams.get('testResultId');
                const exercisePosition = urlParams.get('exercisePosition');
                information.textContent = "Подождите...";
                chrome.scripting.executeScript(
                    {
                        target:{tabId: tab.id, allFrames: true},
                        func:getText,
                        args:[testResultId, twId, last_exercise.value, exercisePosition]
                    }, (results) => {copyText(results[0].result, checkbox.checked)});
            }
            else{
                alert("Неверная страница!");
            }
        } else {
            alert("Нет активных вкладок");
        }
    })
})

async function getText(TRI, TWI, count, EP)
{
    count = parseInt(count);
    var text = "";
    for (let i=EP; i<count+1; i++){
        try{
            let response = await fetch(`https://www.yaklass.ru/TestWorkRun/Exercise?testResultId=${TRI}&exercisePosition=${i}&twId=${TWI}`);
            if (response.ok) {
                let page = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(page, 'text/html');
                text += i + ". ";
                text += doc.getElementById("taskhtml").outerText;
                text += "\n\n";
            }
        }catch{
            
        }
    }
    return text;
}

function copyText(text, checkbox)
{   
    navigator.clipboard.writeText(text);
    if (checkbox)
    {
        information.textContent = "Задания скопированы в буфер обмена!"
        setTimeout(() => {
            alert("Текст скопирован");
        }, 0);
    }
}