const hideNav = {
    hidden: async function hidden() {
        let sideNav = document.querySelector(".side-nav");
        let showBtn = document.querySelector(".show-btn");

        showBtn.addEventListener("click", () => {
            sideNav.classList.toggle("hidden");
            let currentImg = showBtn.getAttribute('src');

            if (currentImg === 'img/bars.svg') {
                showBtn.setAttribute('src', 'img/xmark.svg');
            } else {
                showBtn.setAttribute('src', 'img/bars.svg');
            }
        });
    }
};

export default hideNav;
