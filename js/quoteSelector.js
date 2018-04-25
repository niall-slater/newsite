var quotes = [
    {
        "quote": "Slater has not just redefined the novel but every single word within the novel.",
        "attribution": "Dave Probert"
    },
    {
        "quote": "Had me completely hooked, right up to the first page.",
        "attribution": "Stevyn Colgan"
    },
    {
        "quote": "Not so much a novel as a note-perfect meditation on what the novel could become.",
        "attribution": "Mathew Lyons"
    },
    {
        "quote": "Heartfelt, fragrant, and ultimately worth the lives of the many, many emus who were tragically but necessarily destroyed to make it.",
        "attribution": "@iucounu"
    },
    {
        "quote": "Every sentence is lovingly hand-crafted and comes with a commemorative plate of the late Queen Mother.",
        "attribution": "John Dougherty"
    },
    {
        "quote": "Slater combines the eloquence of words and the silence of punctuation into a book of significant pages that run from beginning to end.",
        "attribution": "Justin K. Hayward"
    },
    {
        "quote": "I found the page numbers strangely compelling.",
        "attribution": "Jonathan L. Howard"
    },
    {
        "quote": "Before the first page, I was sweating. By the second page, I had soaked the first page. A brilliantly absorbing novel.",
        "attribution": "Alex Christofi"
    },
    {
        "quote": "Niall's book is definitely the third-best millipede-rearing instruction manual in my collection, hands down.",
        "attribution": "Kim Staples"
    },
    {
        "quote": "A stunning debut...Slater builds worlds with ease & his complex characterisation will suck you in like the gravity on [insert planet here]",
        "attribution": "Becca Wright"
    }
];

var selector = Math.floor(Math.random()*(quotes.length - 3));

var quoteHolders = document.getElementsByClassName("quoteHolder");
var attributionHolders = document.getElementsByClassName("attributionHolder");

for (var i = 0; i < 3; i++) {
    var selectedQuote = quotes[selector + i];
    quoteHolders[i].innerHTML = '<em>"' + selectedQuote.quote + '"</em>';
    attributionHolders[i].innerHTML = selectedQuote.attribution;
}