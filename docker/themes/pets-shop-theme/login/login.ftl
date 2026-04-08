<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=social.displayInfo displayWide=(realm.password && social.providers??); section>
    <#if section = "header">
        ${msg("loginTitle",realm.name)}
    <#elseif section = "form">
    <div class="petcare-wrapper">
        <!-- Left Panel: Login Form -->
        <div class="login-panel">
            <div class="brand">
                <div class="paw-icon">
                    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="50" cy="62" rx="22" ry="18" fill="#6b7c5c"/>
                        <ellipse cx="28" cy="42" rx="10" ry="13" fill="#6b7c5c"/>
                        <ellipse cx="72" cy="42" rx="10" ry="13" fill="#6b7c5c"/>
                        <ellipse cx="38" cy="28" rx="8" ry="10" fill="#6b7c5c"/>
                        <ellipse cx="62" cy="28" rx="8" ry="10" fill="#6b7c5c"/>
                    </svg>
                </div>
                <span class="brand-name">PETCARE</span>
            </div>

            <h1 class="welcome-title">Welcome back</h1>
            <p class="welcome-sub">Welcome back! Please enter your details.</p>

            <#if realm.password && social.providers??>
                <div class="social-login">
                    <#list social.providers as p>
                        <#if p.alias = "google">
                            <a href="${p.loginUrl}" class="btn-social btn-google">
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Log in with Google
                            </a>
                        <#else>
                            <a href="${p.loginUrl}" class="btn-social btn-generic">
                                ${p.displayName}
                            </a>
                        </#if>
                    </#list>
                </div>
                <div class="divider">
                    <span>or</span>
                </div>
            </#if>

            <#if realm.password>
                <form id="kc-form-login" class="login-form" action="${url.loginAction}" method="post">
                    <div class="form-group">
                        <input
                            tabindex="1"
                            id="username"
                            class="form-control"
                            name="username"
                            type="email"
                            placeholder="Email"
                            autocomplete="off"
                            value="${(login.username!'')}"
                        />
                    </div>

                    <div class="form-group">
                        <input
                            tabindex="2"
                            id="password"
                            class="form-control"
                            name="password"
                            type="password"
                            placeholder="Password"
                            autocomplete="off"
                        />
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" name="rememberMe" <#if login.rememberMe??>checked</#if>>
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        <#if realm.resetPasswordAllowed>
                            <a href="${url.loginResetCredentialsUrl}" class="forgot-link">Forgot password</a>
                        </#if>
                    </div>

                    <#if messagesPerField.existsError('username','password')>
                        <div class="alert-error">
                            <span>${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</span>
                        </div>
                    </#if>

                    <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>

                    <button tabindex="4" class="btn-login" type="submit">Log in</button>
                </form>
            </#if>

            <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                <p class="register-link">
                    Don't have an account? <a href="${url.registrationUrl}">Sign up for free</a>
                </p>
            </#if>
        </div>

        <!-- Right Panel: Illustration -->
        <div class="promo-panel">
            <div class="promo-content">
                <div class="illustration">
                    <!-- Woman holding cat SVG illustration -->
                    <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" class="promo-illustration">
                        <!-- Background decorative elements -->
                        <circle cx="60" cy="120" r="12" fill="#4a5e3a" opacity="0.5"/>
                        <circle cx="260" cy="100" r="8" fill="#4a5e3a" opacity="0.5"/>
                        <circle cx="240" cy="260" r="10" fill="#4a5e3a" opacity="0.4"/>
                        <!-- Hearts -->
                        <path d="M80 80 C80 74, 86 68, 93 74 C100 68, 106 74, 106 80 C106 90, 93 100, 93 100 C93 100, 80 90, 80 80Z" fill="#4a5e3a" opacity="0.6"/>
                        <path d="M220 60 C220 55, 225 50, 230 55 C235 50, 240 55, 240 60 C240 68, 230 76, 230 76 C230 76, 220 68, 220 60Z" fill="#4a5e3a" opacity="0.5"/>
                        <path d="M250 190 C250 186, 254 182, 258 186 C262 182, 266 186, 266 190 C266 196, 258 202, 258 202 C258 202, 250 196, 250 190Z" fill="#4a5e3a" opacity="0.4"/>
                        <!-- Leaves -->
                        <ellipse cx="90" cy="310" rx="40" ry="20" fill="none" stroke="#4a5e3a" stroke-width="2" transform="rotate(-30 90 310)"/>
                        <ellipse cx="230" cy="310" rx="40" ry="20" fill="none" stroke="#4a5e3a" stroke-width="2" transform="rotate(30 230 310)"/>
                        <!-- Body -->
                        <ellipse cx="160" cy="270" rx="70" ry="90" fill="#4a6b7c"/>
                        <!-- Sweater dots -->
                        <circle cx="135" cy="240" r="6" fill="#7a9b6c" opacity="0.7"/>
                        <circle cx="155" cy="255" r="6" fill="#7a9b6c" opacity="0.7"/>
                        <circle cx="175" cy="240" r="6" fill="#7a9b6c" opacity="0.7"/>
                        <circle cx="145" cy="270" r="6" fill="#7a9b6c" opacity="0.7"/>
                        <circle cx="168" cy="270" r="6" fill="#7a9b6c" opacity="0.7"/>
                        <!-- Arms -->
                        <ellipse cx="105" cy="230" rx="25" ry="50" fill="#4a6b7c" transform="rotate(-20 105 230)"/>
                        <ellipse cx="215" cy="230" rx="25" ry="50" fill="#4a6b7c" transform="rotate(20 215 230)"/>
                        <!-- Head -->
                        <ellipse cx="160" cy="150" rx="48" ry="55" fill="#e8b89a"/>
                        <!-- Hair -->
                        <ellipse cx="160" cy="130" rx="52" ry="50" fill="#5c3317"/>
                        <path d="M112 130 Q90 200 100 300" stroke="#5c3317" stroke-width="28" fill="none" stroke-linecap="round"/>
                        <path d="M208 130 Q230 200 220 300" stroke="#5c3317" stroke-width="20" fill="none" stroke-linecap="round"/>
                        <!-- Face -->
                        <ellipse cx="160" cy="160" rx="38" ry="42" fill="#e8b89a"/>
                        <!-- Closed eyes (happy) -->
                        <path d="M143 152 Q148 147 153 152" stroke="#5c3317" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M167 152 Q172 147 177 152" stroke="#5c3317" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <!-- Cheeks -->
                        <circle cx="140" cy="165" r="10" fill="#e89090" opacity="0.5"/>
                        <circle cx="180" cy="165" r="10" fill="#e89090" opacity="0.5"/>
                        <!-- Cat -->
                        <ellipse cx="155" cy="195" rx="35" ry="30" fill="#f0e8d8"/>
                        <!-- Cat head -->
                        <ellipse cx="155" cy="168" rx="28" ry="26" fill="#f0e8d8"/>
                        <!-- Cat ears -->
                        <polygon points="130,148 122,130 142,145" fill="#f0e8d8"/>
                        <polygon points="180,148 188,130 168,145" fill="#f0e8d8"/>
                        <polygon points="132,146 126,133 140,144" fill="#e8c0b0"/>
                        <polygon points="178,146 184,133 170,144" fill="#e8c0b0"/>
                        <!-- Cat face -->
                        <circle cx="147" cy="165" r="4" fill="#333" />
                        <circle cx="163" cy="165" r="4" fill="#333"/>
                        <circle cx="148" cy="163" r="1.5" fill="white"/>
                        <circle cx="164" cy="163" r="1.5" fill="white"/>
                        <circle cx="155" cy="172" r="3" fill="#e8a0a0"/>
                        <!-- Cat whiskers -->
                        <line x1="130" y1="170" x2="150" y2="173" stroke="#888" stroke-width="1"/>
                        <line x1="130" y1="175" x2="150" y2="175" stroke="#888" stroke-width="1"/>
                        <line x1="180" y1="170" x2="160" y2="173" stroke="#888" stroke-width="1"/>
                        <line x1="180" y1="175" x2="160" y2="175" stroke="#888" stroke-width="1"/>
                        <!-- Sweater ribbing at bottom -->
                        <path d="M95 340 Q160 355 225 340" stroke="#3a5568" stroke-width="3" fill="none"/>
                        <path d="M100 348 Q160 363 220 348" stroke="#3a5568" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <div class="promo-text">
                    <h2>We Love The Pet Like You Love The Pet</h2>
                    <p>Your pet deserves the best care. Join thousands of pet owners who trust PetCare for appointments, health tracking, and more.</p>
                </div>
                <div class="carousel-nav">
                    <div class="dots">
                        <span class="dot active"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                    <div class="arrows">
                        <button class="arrow-btn" onclick="prevSlide()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button class="arrow-btn" onclick="nextSlide()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </#if>
</@layout.registrationLayout>
