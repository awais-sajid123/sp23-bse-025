// Select the profile image and objective section
const profileImg = document.getElementById("profile-img");
const objective = document.querySelector(".objective");

// Add hover event on profile image
profileImg.addEventListener("mouseenter", () => {
    // Show the objective box when hovered
    objective.style.position = "fixed";
    objective.style.top = "10px";
    objective.style.right = "10px";
    objective.style.width = "250px";
    objective.style.border = "1px solid #ccc";
    objective.style.padding = "10px";
    objective.style.backgroundColor = "#fff";
    objective.style.display = "block";
    objective.style.zIndex = "1000";
});

// Hide objective when mouse leaves the image
profileImg.addEventListener("mouseleave", () => {
    // Revert the objective box to its normal position
    objective.style.position = "static";
    objective.style.display = "block"; // Ensure it remains visible
});
