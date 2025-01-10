
// Create a bootstrap alert and append it to the alert container to dislay it using bootstrap classes.
// take 2 arguments: message, and type of the alert (default success)
export function showAlert(message, type="success") {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible text-center position-fixed top-0 start-50 translate-middle-x w-100`;
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Display the alert in front of all the other elements
    alert.style.zIndex = '9999';

    // Delete the previous alert and Add the alert to the container
    const alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Remove the alert after 5 seconds
    setTimeout(() => {
        alert.classList.remove("show");
        alert.classList.add("fade");
        setTimeout(() => alert.remove(), 500);
    }, 2000);
}