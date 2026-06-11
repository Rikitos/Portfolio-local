<?php
get_header();
?>


<section class="hero">
    <div class="hero__container">
        <p class="hero__container-p">witaj!</p>
        <h1 class="hero__container-h1">jestem Krzysztof Pabisz</h1>
        <h2 class="hero__container-h2">web developer - freelancer</h2>
        <button class="hero__btn"><a href="#projekty">Zobacz moje portfolio</a></button>
    </div>
    <img class="hero__img" src="<?php echo get_theme_file_uri('/assets/images/photo1.png'); ?>" alt="Zdjęcie Krzysztof Pabisz">
</section>

<section class="features clearfix">
    <h1 class="features-h1">Tworzę bardzo dobre strony internetowe</h1>
    <div class="feature">
        <img class="feature-img" src="<?php echo get_theme_file_uri('/assets/images/services1.png'); ?>" alt="loga html js i css">
        <h2 class="feature-h2">Nowoczesne i zgodne z aktualnymi standardami</h2>
        <p class="feature-description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias corporis cumque
            debitis delectus, deserunt earum eius eum harum incidunt laboriosam laborum obcaecati quae quo, sed sint
            veritatis vitae voluptas voluptatibus.</p>
    </div>
    <div class="feature">
        <img class="feature-img" src="<?php echo get_theme_file_uri('/assets/images/services2.png'); ?>" alt="loga html js i css">
        <h2 class="feature-h2">Zoptymalizowanie pod kątem wyszukiwarek internetowych</h2>
        <p class="feature-description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias corporis cumque
            debitis delectus, deserunt earum eius eum harum incidunt laboriosam laborum obcaecati quae quo, sed sint
            veritatis vitae voluptas voluptatibus.</p>
    </div>
    <div class="feature">
        <img class="feature-img" src="<?php echo get_theme_file_uri('/assets/images/services3.png'); ?>" alt="loga html js i css">
        <h2 class="feature-h2">Świetnie wyglądające na urządzeniach mobilnych</h2>
        <p class="feature-description">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias corporis cumque
            debitis delectus, deserunt earum eius eum harum incidunt laboriosam laborum obcaecati quae quo, sed sint
            veritatis vitae voluptas voluptatibus.</p>
    </div>
</section>

<section id="projekty" class="portfolio">
    <h1 class="portfolio-h1">Projekty</h1>
    <div class="project clearfix">
        <div class="project__web">
            <img class="project__web-img" src="<?php echo get_theme_file_uri('/assets/images/portfolio1.jpg'); ?>" alt="portfolio przykład 1">
        </div>
        <div class="project__about">
            <h2 class="project__about-h2">Cat meme Generator</h2>
            <p class="project__about-p">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aut debitis dicta dolor dolorem
                ducimus, ea eligendi esse eveniet ex exercitationem illum ipsam officia quidem ratione rem sunt
                vitae voluptates!</p>
        </div>
    </div>
    <div class="project clearfix">
        <div class="project__web">
            <img class="project__web-img" src="<?php echo get_theme_file_uri('/assets/images/portfolio2.jpg'); ?>" alt="portfolio przykład 2">
        </div>
        <div class="project__about">
            <h2 class="project__about-h2">Galeria</h2>
            <p class="project__about-p">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aut debitis dicta dolor dolorem
                ducimus, ea eligendi esse eveniet ex exercitationem illum ipsam officia quidem ratione rem sunt
                vitae voluptates!</p>
        </div>
    </div>
    <div class="project clearfix">
        <div class="project__web">
            <img class="project__web-img" src="<?php echo get_theme_file_uri('/assets/images/portfolio3.jpg'); ?>" alt="portfolio przykład 3">
        </div>
        <div class="project__about">
            <h2 class="project__about-h2">Nazwa projektu</h2>
            <p class="project__about-p">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aut debitis dicta dolor dolorem
                ducimus, ea eligendi esse eveniet ex exercitationem illum ipsam officia quidem ratione rem sunt
                vitae voluptates!</p>
        </div>
    </div>
    <div class="project clearfix">
        <div class="project__web">
            <img class="project__web-img" src="<?php echo get_theme_file_uri('/assets/images/portfolio4.jpg'); ?>" alt="portfolio przykład 4">
        </div>
        <div class="project__about">
            <h2 class="project__about-h2">Nazwa projektu</h2>
            <p class="project__about-p">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid aut debitis dicta dolor dolorem
                ducimus, ea eligendi esse eveniet ex exercitationem illum ipsam officia quidem ratione rem sunt
                vitae voluptates!</p>
        </div>
    </div>
</section>

<section class="slogan">
    <div class="slogan__bg">
        <h1 class="slogan-h1">Moje życiowe motto</h1>
        <p class="slogan-text">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur corporis cumque eius
            est et illo illum iure necessitatibus nihil obcaecati, offic</p>
        <p class="slogan-author">Aurelius</p>
    </div>
</section>

<section class="hobby clearfix">
    <h1 class="hobby-h1">W wolnym czasie uwielbiam</h1>
    <div class="hobby__item">
        <p class="hobby__item-p">Chodzić po górach</p>
    </div>
    <div class="hobby__item">
        <p class="hobby__item-p">Mierzyć wysoko</p>
    </div>
    <div class="hobby__item">
        <p class="hobby__item-p">Zmieniać świat</p>
    </div>
    <div class="hobby__item">
        <p class="hobby__item-p">Jeść owoce i warzywa</p>
    </div>
</section>

<section class="contact">
    <h1 class="contact-h1">Skontaktuj się ze mną</h1>
    <div class="contact__wrap wrap clearfix">
        <form class="wrap__form form">
            <input class="wrap__form-input" type="text" placeholder="Twoje imię">
            <input class="wrap__form-input" type="text" placeholder="Email">
            <textarea class="wrap__form-textarea" name="" placeholder="Twoja wiadomość"></textarea>
            <button class="wrap__form-btn">Wyślij wiadomość</button>
        </form>

        <div class="wrap__socials socials">
            <div class="socials__social clearfix"><img class="socials__social-img" src="<?php echo get_theme_file_uri('/assets/images/contact1.png'); ?>"
                    alt="mail"><span>krzysiek.pabisz@gmail.com</span></div>
            <div class="socials__social clearfix"><img class="socials__social-img" src="<?php echo get_theme_file_uri('/assets/images/contact2.png'); ?>" alt="telefon"><span>565 333 111</span></div>
            <div class="socials__social clearfix"><img class="socials__social-img" src="<?php echo get_theme_file_uri('/assets/images/contact3.png'); ?>" alt="fb"><span>Krzysztof Pabisz</span></div>
            <div class="socials__social clearfix"><img class="socials__social-img" src="<?php echo get_theme_file_uri('/assets/images/contact4.png'); ?>" alt="twitter"><span>@Krzysztof_Pabisz</span>
            </div>
            <div class="socials__social clearfix"><img class="socials__social-img" src="<?php echo get_theme_file_uri('/assets/images/contact5.png'); ?>" alt="linkedin"><span>KrzysztofPabisz</span>
            </div>
        </div>
    </div>
</section>

<?php
get_footer();
?>