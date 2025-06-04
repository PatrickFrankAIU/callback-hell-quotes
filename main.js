window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#fetchQuotesBtn").addEventListener("click", () => {
        // Get values from drop-downs
        const topicDropdown = document.querySelector("#topicSelection");
        const selectedTopic = topicDropdown.options[topicDropdown.selectedIndex].value;
        const countDropdown = document.querySelector("#countSelection");
        const selectedCount = countDropdown.options[countDropdown.selectedIndex].value;
        
        // Reset dashboard and start fetching
        resetDashboard();
        fetchQuotes(selectedTopic, selectedCount);
    });
});

// Reset all sections to loading state
function resetDashboard() {
    // Clear all content sections and show spinners
    showSpinner("quotes");
    showSpinner("authorInfo");
    showSpinner("relatedQuotes");
    showSpinner("randomQuote");
    
    updateProgress(0, "Starting to fetch data...");
    
    // Disable the button during loading
    const button = document.querySelector("#fetchQuotesBtn");
    button.disabled = true;
    button.textContent = "Loading...";
}

// Show spinner in a specific section
function showSpinner(sectionId) {
    const content = document.querySelector("#" + sectionId);
    content.innerHTML = '<div class="spinner"></div>';
}

// Update progress bar and text
function updateProgress(percentage, text) {
    const progressFill = document.querySelector("#progressFill");
    const progressText = document.querySelector("#progressText");
    
    progressFill.style.width = percentage + "%";
    progressText.textContent = text;
}

// Re-enable button when done
function enableButton() {
    const button = document.querySelector("#fetchQuotesBtn");
    button.disabled = false;
    button.textContent = "Fetch All Data";
}

// Main function that demonstrates callback hell
function fetchQuotes(topic, count) {
    const endpoint = "https://wp.zybooks.com/quotes.php"; 
    const queryString = "topic=" + topic + "&count=" + count;
    const url = endpoint + "?" + queryString;

    // First asynchronous operation (fetching quotes)
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Step 1: Quotes fetched for topic:", topic);
            updateProgress(20, "Step 1/5: Quotes loaded!");
            
            const quoteData = xhr.response;
            displayQuotes(quoteData, count);
            
            // Simulate delay before next request
            setTimeout(() => {
                // Second asynchronous operation (fetching author details)
                let authorXhr = new XMLHttpRequest();
                authorXhr.open("GET", url); // Reusing the same URL for demo
                authorXhr.responseType = "json";
                authorXhr.onload = function () {
                    if (authorXhr.status === 200) {
                        console.log("Step 2: Author details fetched for topic:", topic);
                        updateProgress(40, "Step 2/5: Author info loaded!");
                        
                        const authorData = authorXhr.response;
                        displayAuthorInfo(authorData);
                        
                        // Simulate delay before next request
                        setTimeout(() => {
                            // Third asynchronous operation (fetch related quotes)
                            let relatedQuotesXhr = new XMLHttpRequest();
                            relatedQuotesXhr.open("GET", url); // Reusing endpoint for demo
                            relatedQuotesXhr.responseType = "json";
                            relatedQuotesXhr.onload = function () {
                                if (relatedQuotesXhr.status === 200) {
                                    console.log("Step 3: Related quotes fetched for topic:", topic);
                                    updateProgress(60, "Step 3/5: Related quotes loaded!");
                                    
                                    const relatedQuotes = relatedQuotesXhr.response;
                                    displayRelatedQuotes(relatedQuotes);
                                    
                                    // Simulate delay before next request
                                    setTimeout(() => {
                                        // Fourth asynchronous operation (fetch random quote)
                                        let randomQuoteXhr = new XMLHttpRequest();
                                        randomQuoteXhr.open("GET", url); // Same endpoint
                                        randomQuoteXhr.responseType = "json";
                                        randomQuoteXhr.onload = function () {
                                            if (randomQuoteXhr.status === 200) {
                                                console.log("Step 4: Random quote fetched for topic:", topic);
                                                updateProgress(80, "Step 4/5: Random quote loaded!");
                                                
                                                const randomQuote = randomQuoteXhr.response;
                                                displayRandomQuote(randomQuote);
                                                
                                                // Final processing step
                                                setTimeout(() => {
                                                    console.log("Step 5: All data processing complete!");
                                                    updateProgress(100, "Complete! All data loaded successfully.");
                                                    enableButton();
                                                }, 800);
                                            } else {
                                                handleError("Error fetching random quote: " + randomQuoteXhr.status);
                                            }
                                        };
                                        randomQuoteXhr.onerror = () => {
                                            handleError("Network error while fetching random quote.");
                                        };
                                        randomQuoteXhr.send();
                                    }, 1000);
                                } else {
                                    handleError("Error fetching related quotes: " + relatedQuotesXhr.status);
                                }
                            };
                            relatedQuotesXhr.onerror = () => {
                                handleError("Network error while fetching related quotes.");
                            };
                            relatedQuotesXhr.send();
                        }, 1000);
                    } else {
                        handleError("Error fetching author details: " + authorXhr.status);
                    }
                };
                authorXhr.onerror = () => {
                    handleError("Network error while fetching author details.");
                };
                authorXhr.send();
            }, 1000);
        } else {
            handleError("Error fetching quotes: " + xhr.status);
        }
    };
    xhr.onerror = () => {
        handleError("Network error while fetching quotes.");
    };
    xhr.send();
}

// Display functions for each section
function displayQuotes(quoteData, count) {
    const quotesDiv = document.querySelector("#quotes");
    let html = "<h3>Requested " + count + " quotes:</h3>";
    
    if (quoteData.error) {
        html += '<div class="error">' + quoteData.error + '</div>';
    } else {
        quoteData.forEach((quoteItem, index) => {
            html += '<div class="quote-item">';
            html += '<div class="quote-text">"' + quoteItem.quote + '"</div>';
            html += '<div class="quote-source">— ' + quoteItem.source + '</div>';
            html += '</div>';
        });
    }
    
    quotesDiv.innerHTML = html;
}

function displayAuthorInfo(authorData) {
    const authorDiv = document.querySelector("#authorInfo");
    let html = '<div class="author-card">';
    
    if (authorData.error) {
        html += '<div class="error">' + authorData.error + '</div>';
    } else {
        // Since the API doesn't return author info, we'll simulate it
        if (authorData.length > 0) {
            const firstQuote = authorData[0];
            html += '<div class="author-name">' + firstQuote.source + '</div>';
            html += '<div class="author-bio">Author information would be fetched from a separate author API endpoint. This demonstrates why we need multiple sequential API calls.</div>';
        } else {
            html += '<div class="author-name">Various Authors</div>';
            html += '<div class="author-bio">Multiple authors contribute to this collection.</div>';
        }
    }
    
    html += '</div>';
    authorDiv.innerHTML = html;
}

function displayRelatedQuotes(relatedQuotes) {
    const relatedDiv = document.querySelector("#relatedQuotes");
    let html = "<h3>Related content:</h3>";
    
    if (relatedQuotes.error) {
        html += '<div class="error">' + relatedQuotes.error + '</div>';
    } else {
        // Show first 2 quotes as "related"
        const limitedQuotes = relatedQuotes.slice(0, 2);
        limitedQuotes.forEach((quoteItem) => {
            html += '<div class="quote-item">';
            html += '<div class="quote-text">"' + quoteItem.quote + '"</div>';
            html += '<div class="quote-source">— ' + quoteItem.source + '</div>';
            html += '</div>';
        });
        html += '<p style="color: #666; font-style: italic;">Related quotes would come from a different API endpoint based on the original quotes.</p>';
    }
    
    relatedDiv.innerHTML = html;
}

function displayRandomQuote(randomQuote) {
    const randomDiv = document.querySelector("#randomQuote");
    let html = "<h3>Quote of the day:</h3>";
    
    if (randomQuote.error) {
        html += '<div class="error">' + randomQuote.error + '</div>';
    } else {
        if (randomQuote.length > 0) {
            // Show the last quote as "random"
            const lastQuote = randomQuote[randomQuote.length - 1];
            html += '<div class="quote-item">';
            html += '<div class="quote-text">"' + lastQuote.quote + '"</div>';
            html += '<div class="quote-source">— ' + lastQuote.source + '</div>';
            html += '</div>';
        }
        html += '<p style="color: #666; font-style: italic;">This would come from a random quote API endpoint.</p>';
    }
    
    randomDiv.innerHTML = html;
}

// Error handling function
function handleError(errorMessage) {
    console.error(errorMessage);
    updateProgress(0, "Error occurred during data fetching");
    enableButton();
    
    // Show error in all remaining sections
    const sections = ["quotes", "authorInfo", "relatedQuotes", "randomQuote"];
    sections.forEach((sectionId) => {
        const content = document.querySelector("#" + sectionId);
        if (content.innerHTML.includes("spinner")) {
            content.innerHTML = '<div class="error">' + errorMessage + '</div>';
        }
    });
}