declare let $: any;

$(function() {
  let SERVICES_KEY = 'calculator.servicesv3';
  let CURRENCY_KEY = 'acomuser.currency';

  function createLinkElement(label, onclick) {
    let a = document.createElement('a');
    a.className = 'button toggle-service-picker';
    a.style.marginLeft = '30px';
    a.innerText = label;
    a.href = '#';
    a.addEventListener('click', function(e) {
      e.preventDefault();
      onclick(e);
    });

    return a;
  }

  function triggerExportJSON() {
    try {
      let servicesJson = window.localStorage.getItem(SERVICES_KEY);
      let servicesObj = JSON.parse(servicesJson);
      let currencyStr = window.localStorage.getItem(CURRENCY_KEY);
      let now = new Date();
      let exportedObj = {
        version: '0.1',
        createdAt: now.toISOString(),
        data: [
          {
            key: SERVICES_KEY,
            transform: 'JSON.stringify',
            value: servicesObj
          },
          {
            key: CURRENCY_KEY,
            value: currencyStr
          }
        ]
      };
      let exportedJson = JSON.stringify(exportedObj, null, 2);
      let exportedBlob = new Blob([exportedJson]);
      let exportedBlobUrl = URL.createObjectURL(exportedBlob /* , {type: 'application/json'} */);
      let fauxLink = document.createElement('a');
      fauxLink.href = exportedBlobUrl;
      fauxLink.setAttribute('download', 'export.json');
      document.body.appendChild(fauxLink);
      alert('Exporting estimate as JSON. Due to a bug, if you\'re using Edge, make sure to rename the file as * .json.');
      fauxLink.click();
    }
    catch (e) {
      console.error(e);
    }
  }

  function triggerImportJSON() {
    let input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.addEventListener('change', handleFileUpload);
    document.body.appendChild(input);
    input.click();
  }

  function handleFileUpload(e) {
    try {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = function(e: any) {
        let importedJson = e.target.result;
        let importedObj = JSON.parse(importedJson);
        importedObj.data.forEach(function(entry) {
          let value = entry.value;
          if (entry.transform === 'JSON.stringify') {
            value = JSON.stringify(value);
          }
          localStorage.setItem(entry.key, value);
        });
        alert('Import successful. Reloading the page...');
        window.location.reload();
      };
      reader.readAsText(file);
    }
    catch (e) {
      alert('Importing failed: ' + e.toString());
    }
  }

  function init() {
    let a1 = createLinkElement('Export JSON', triggerExportJSON);
    let a2 = createLinkElement('Import JSON', triggerImportJSON);
    let div = document.querySelector('div.service-picker .banner-content');
    div.appendChild(a1);
    div.appendChild(a2);
  }

  init();
});
