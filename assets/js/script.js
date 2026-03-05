
const verses=[
["Matthew 11:28","Come to me, all who are weary and burdened, and I will give you rest."],
["Psalm 23:1","The Lord is my shepherd; I lack nothing."],
["Proverbs 3:5","Trust in the Lord with all your heart."],
["Joshua 1:9","Be strong and courageous. The Lord your God will be with you."]
];
let i=0;
function rotate(){
i=(i+1)%verses.length;
document.getElementById("verseRef").innerText=verses[i][0];
document.getElementById("verseText").innerText=verses[i][1];
}
setInterval(rotate,8000);
