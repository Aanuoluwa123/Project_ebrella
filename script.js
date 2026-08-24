const orderButtons = document.querySelectorAll('.shop-card .order-btn');

orderButtons.forEach(function(orderButton) {

    orderButton.addEventListener('click', function(event) {

        event.preventDefault();

        const product = orderButton.dataset.product;

        const message = `Hi! I would like to order the ${product}.`;

        const encodedMessage = encodeURIComponent(message);

        const whatsappURL = `https://wa.me/2349126831215?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');

    });

});