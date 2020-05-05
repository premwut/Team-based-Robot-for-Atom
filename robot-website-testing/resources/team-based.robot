*** Keywords ***
TB Open Browser To Landing Page
	[Arguments]	${BROWSER}=chrome
	Open browser	${WEB_BASE_URL}	${BROWSER}
	Set Selenium Speed	${SPEED}

TB Desktop - Login by admin success
	[Tags]	login	regression	high	desktop
	Open Browser To Landing Page
	Change Resolution To Desktop
	Go To Login Page
	Fill Input Login Form	${USERNAME_ADMIN}	${PASSWORD_ADMIN}
	Verify Admin Page Is Visible
