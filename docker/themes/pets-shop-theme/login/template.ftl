<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">

    <title>PetCare - ${msg("loginTitle", realm.name)}</title>

    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>"/>

    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>

    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>

    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>

    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>

<body class="${properties.kcBodyClass!}">

    <#nested "header">
    <#nested "form">

    <script>
        // Simple carousel logic for dot navigation
        let currentSlide = 0;
        const slides = [
            { title: "We Love The Pet Like You Love The Pet", text: "Your pet deserves the best care. Join thousands of pet owners who trust PetCare for appointments, health tracking, and more." },
            { title: "Track Your Pet's Health", text: "Monitor vaccinations, medications, and vet visits in one place. Keep your furry friend healthy and happy." },
            { title: "Find Trusted Vets Nearby", text: "Discover top-rated veterinarians in your area. Book appointments in seconds, anytime." },
            { title: "Never Miss a Reminder", text: "Get notified about upcoming vet visits, medication schedules, and more — right when you need it." }
        ];

        function updateSlide() {
            const dots = document.querySelectorAll('.dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
            const s = slides[currentSlide];
            if (s) {
                const h2 = document.querySelector('.promo-text h2');
                const p = document.querySelector('.promo-text p');
                if (h2) h2.textContent = s.title;
                if (p) p.textContent = s.text;
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlide();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlide();
        }

        // Click dots to navigate
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.dot').forEach((dot, i) => {
                dot.addEventListener('click', () => { currentSlide = i; updateSlide(); });
            });
        });
    </script>
</body>
</html>
