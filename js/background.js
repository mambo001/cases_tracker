/////////////////
// API Endpoints
////////////////

// // Prod
const URL_CTE = `https://script.google.com/a/google.com/macros/s/AKfycbzjhgxDHp_UlzjHnsguxTpt-FOTqPkAPGnFVGJeXUw/dev`;

// Testing
// const URL_CTE = `https://script.google.com/a/macros/google.com/s/AKfycbwrqh3Z7i-_JmdSPBZ3K5w81sOPwavNe-LyMpCLfHk/dev`;


const URL_CTE2 = `https://script.google.com/a/google.com/macros/s/AKfycbw6tEzDQXsxVzmGOSNnfL9yZrCSJKxSLNxq7QriThKh/dev`;
const URL_QM  = `https://script.google.com/a/macros/google.com/s/AKfycbwey7b36eX2Er8jnJXi04UhW01-U2LONfM_YoOz6LSI/dev`;
const URL_BLSScraper = `https://script.google.com/a/google.com/macros/s/AKfycbxzRc1TpiQGRNWZWbbv9XqMJuuPuQgvxO-3ywPZbeY/dev`;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        
        
        
        if (request.contentScriptQuery == "queryPrice") {
          console.log("Query: queryPrice")
          const url = `${URL_CTE}?action=read`;
          fetch(url)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
          return true;  // Will respond asynchronously.
        } else if (request.contentScriptQuery == "consultedBucketQuery"){
            
          console.log("Query: consultedBucketQuery")
            
          // Consulted Bucket Query
          const urlConsulted = `${URL_CTE}?action=read&tab=Consulted%20Bucket`;
          fetch(urlConsulted)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
          return true;  // Will respond asynchronously.

        } else if (request.contentScriptQuery == "submittedBucketQuery"){
            
          console.log("Query: submittedBucketQuery")
            
          // Submitted Bucket Query
          const urlSubmitted = `${URL_CTE}?action=read&tab=All%20Cases`;
          fetch(urlSubmitted)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
          return true;  // Will respond asynchronously.
          
        } else if (request.contentScriptQuery == "QMPrioDumpQuery"){
            
          console.log("Query: QMPrioDumpQuery")
            
          // Submitted Bucket Query
          const QMPrioURL = `${URL_QM}?action=read&tab=QM%20-%20Prio`;
        //   const urlSubmitted = "https://script.google.com/a/google.com/macros/s/AKfycbzjhgxDHp_UlzjHnsguxTpt-FOTqPkAPGnFVGJeXUw/dev?action=read&tab=All%20Cases";
          fetch(QMPrioURL)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
          return true;  // Will respond asynchronously.
          
        } else if (request.contentScriptQuery == "submitQMQuery"){
                  // QM Endpoint
          const QMSubmitURL = `${URL_QM}?flag=1`;
            
          fetch(QMSubmitURL,{
              method: 'POST',
              cache: 'no-cache',
              redirect: 'follow',
              body: JSON.stringify(request.postData)
          })
          .then(response => response.json())
          .then(data => sendResponse(data))
          .catch(error => sendResponse({response: 'error'}))
          return true;  // Will respond asynchronously.

        } else if (request.contentScriptQuery == "templatedBucketQuery"){
            console.log("Query: templatedBucketQuery")
                
              // Template Bucket Query
            const urlTemplate = `${URL_CTE}?action=read&tab=Template%20Bucket`;
            fetch(urlTemplate)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
              
        } else if (request.contentScriptQuery == "finishedCaseQuery"){
            // https://script.google.com/a/google.com/macros/s/AKfycbzjhgxDHp_UlzjHnsguxTpt-FOTqPkAPGnFVGJeXUw/dev?action=insert&
            let { caseData,bucketNumber } = request;
            console.log("Query: finishedCaseQuery")
            console.log({caseData}, {bucketNumber})
            
            // GET    
            // Finished Case Query
            // const url = `${URL_CTE}?action=insert&${caseData}&bucketNumber=${bucketNumber}`;
            // fetch(url)
            //   .then(response => response.json())
            //   .then(data => sendResponse(data))
            //   .catch(error => sendResponse({response: 'error'}))
            //   return true;  // Will respond asynchronously.
              
            // POST
            const url = `${URL_CTE}?action=insert&bucketNumber=${bucketNumber}`;  
            fetch(url,{
              method: 'POST',
              cache: 'no-cache',
              redirect: 'follow',
              body: JSON.stringify(caseData)
            //   first half to array element from array data
            })
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
              
              
        } else if (request.contentScriptQuery == "submitScrapedCasesQuery"){
            console.log("Query: submitScrapedCasesQuery")
            
            const url = `${URL_BLSScraper}?ldap=${request.ldap}`;
            
            fetch(url,{
              method: 'POST',
              cache: 'no-cache',
              redirect: 'follow',
              body: JSON.stringify(request.data)
            //   first half to array element from array data
            })
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
            
        } else if (request.contentScriptQuery == "consultCaseQuery"){
            
            console.log("Query: consultCaseQuery")
            
            const url = `${URL_CTE}?action=insert&tab=Consulted%20Bucket&${request.parameters}`;
            
            fetch(url)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
        } else if (request.contentScriptQuery == "consultedCaseAssignedQuery"){
            console.log("Query: consultedCaseAssignedQuery")
            
            const url = `${URL_CTE}?action=delete&tab=Consulted%20Bucket&id=${request.parameters}`;
            
            fetch(url)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
              
        } else if (request.contentScriptQuery == "saveTemplateQuery"){
            console.log("Query: saveTemplateQuery")
            
            const url = `${URL_CTE2}?action=insert&tab=Template%20Bucket&${request.parameters}`;
            
            fetch(url)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
        } else if (request.contentScriptQuery == "SPRARQuery"){
            console.log("Query: SPRARQuery")
            
            const url = `${URL_QM}?action=read&tab=SPR-AR`;
            
            // https://script.google.com/a/macros/google.com/s/AKfycbwey7b36eX2Er8jnJXi04UhW01-U2LONfM_YoOz6LSI/dev?action=read
            
            
            fetch(url)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
              
              
        } else if (request.contentScriptQuery == "changeCaseStatesSPRQuery"){
            console.log("Query: changeCaseStatesSPRQuery");
            
            const { caseID, status } = request.parameters;
            // const stringifiedCaseData = JSON.stringify(data);
            const url = `${URL_QM}?action=updateCaseStatus&caseID=${caseID}&caseStatus=${status}`;
            
            // https://script.google.com/a/macros/google.com/s/AKfycbwey7b36eX2Er8jnJXi04UhW01-U2LONfM_YoOz6LSI/dev?action=read
            
            
            fetch(url)
              .then(response => response.json())
              .then(data => sendResponse(data))
              .catch(error => sendResponse({response: 'error'}))
              return true;  // Will respond asynchronously.
        }
    }
);