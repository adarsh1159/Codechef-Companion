
/* =========================================
   FEATURE 1: DOM ELEMENTS
   ========================================= */

const navLinks=document.querySelectorAll("nav a");
const collectionCards=document.querySelectorAll(".collection-card");
const connectBtn=document.querySelector(".connect-btn");
const primaryBtn=document.querySelector(".primary-btn");
const viewBtn=document.querySelector(".view-btn");


/* =========================================
   FEATURE 1: SIDEBAR NAVIGATION
   ========================================= */

navLinks.forEach(link=>{
    link.addEventListener("click",e=>{
        e.preventDefault();

        navLinks.forEach(item=>{
            item.classList.remove("active");
        });

        link.classList.add("active");

        console.log("Navigation:",link.innerText.trim());
    });
});


/* =========================================
   FEATURE 1: COLLECTION CARDS
   ========================================= */

collectionCards.forEach(card=>{
    card.addEventListener("click",()=>{
        console.log("Collection clicked:",card.innerText.trim());
    });
});


/* =========================================
   FEATURE 1: CONNECT CODECHEF BUTTON
   ========================================= */

/*
   Actual CodeChef username/ID functionality
   will be implemented in a later feature.
*/

connectBtn.addEventListener("click",()=>{
    console.log("Connect CodeChef clicked");
});


/* =========================================
   FEATURE 1: EXPLORE PROBLEMS BUTTON
   ========================================= */

/*
   Actual problem navigation will be implemented
   when the problem/contest features are added.
*/

primaryBtn.addEventListener("click",()=>{
    console.log("Explore Problems clicked");
});


/* =========================================
   FEATURE 1: VIEW ALL BUTTON
   ========================================= */

/*
   Actual contest/problem listing will be
   connected in later features.
*/

viewBtn.addEventListener("click",()=>{
    console.log("View All clicked");
});


/* =========================================
   FEATURE 1: APP INITIALIZATION
   ========================================= */

console.log("CodeChef Companion - Feature 1 loaded");

