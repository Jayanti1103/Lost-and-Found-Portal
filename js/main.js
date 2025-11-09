// This code runs when the page is fully loaded
$(document).ready(function() {

    // --- Navbar Active Page Highlighter ---
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page == "") {
        page = "index.html";
    }
    var navLinks = $(".navbar-nav .nav-link");
    navLinks.each(function() {
        var href = $(this).attr("href");
        if (href == page) {
            $(this).closest(".nav-item").addClass("active");
        }
    });
    // --- End of Navbar Highlighter ---


    // --- Code for Claim Modal ---
    $('#claimModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); 
        var itemTitle = button.data('item-title'); 
        var modal = $(this);
        modal.find('#claimItemTitle').text('Claiming: ' + itemTitle);
    });

    $('#submitClaimButton').on('click', function() {
        alert('Your claim has been submitted for review!');
        $('#claimModal').modal('hide');
        $('#claimForm')[0].reset(); 
    });
    // --- End of Code for Claim Modal ---


    // --- Report Form File Upload Preview ---
    $('#item_image').on('change', function(event) {
        var file = event.target.files[0];
        if (file) {
            $('#image-label').text(file.name);
            var reader = new FileReader();
            reader.onload = function(e) {
                var preview = $('#image-preview');
                preview.attr('src', e.target.result);
                preview.show(); 
            };
            reader.readAsDataURL(file);
        } else {
            $('#image-label').text('Choose file...');
            $('#image-preview').hide().attr('src', '#');
        }
    });
    // --- End of Report Form ---


    // --- Register Form Validation ---
    $('#registerForm').on('submit', function(event) {
        event.preventDefault();
        function showError(inputId, message) {
            var input = $(inputId);
            input.addClass('is-invalid');
            input.siblings('.invalid-feedback').text(message).show();
        }
        function clearError(inputId) {
            var input = $(inputId);
            input.removeClass('is-invalid');
            input.siblings('.invalid-feedback').text('').hide();
        }
        function clearAllErrors() {
            $('#registerForm .form-control').removeClass('is-invalid');
            $('#registerForm .invalid-feedback').text('').hide();
            $('#register-success').hide();
        }
        clearAllErrors();
        var isValid = true;
        var name = $('#userName').val().trim();
        var email = $('#userEmail').val().trim();
        var pass1 = $('#userPassword').val().trim();
        var pass2 = $('#confirmPassword').val().trim();
        if (name === '') {
            showError('#userName', 'Please enter your name.');
            isValid = false;
        }
        if (email === '') {
            showError('#userEmail', 'Please enter your email address.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('#userEmail', 'Please enter a valid email address.');
            isValid = false;
        }
        if (pass1 === '') {
            showError('#userPassword', 'Please create a password.');
            isValid = false;
        } else if (pass1.length < 8) {
            showError('#userPassword', 'Password must be at least 8 characters long.');
            isValid = false;
        }
        if (pass2 === '') {
            showError('#confirmPassword', 'Please confirm your password.');
            isValid = false;
        } else if (pass1 !== pass2) {
            showError('#confirmPassword', 'Passwords do not match.');
            isValid = false;
        }
        if (isValid) {
            $('#register-success').show();
        }
    });
    // --- End of Register Form Validation ---

}); // <-- END of $(document).ready(...)


// --- Scroll Fade-in Animation ---
// This block MUST be OUTSIDE the $(document).ready(...)

// Check if the browser supports this feature
if ('IntersectionObserver' in window) {

    // Find all the elements we marked with .scroll-animate
    const elementsToAnimate = document.querySelectorAll('.scroll-animate');

    // Create a new observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When the element is in view
            if (entry.isIntersecting) {
                // Add the 'fade-in' class to trigger the CSS animation
                entry.target.classList.add('fade-in');

                // Stop watching this element so it only animates once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    // Tell the observer to watch each of our elements
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

} // --- End of Scroll Animation ---