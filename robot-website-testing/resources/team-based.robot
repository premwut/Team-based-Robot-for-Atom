*** Keywords ***
TB Open Browser To Landing Page
	[Arguments]	${BROWSER}=chrome
	Open browser	${WEB_BASE_URL}	${BROWSER}
	Set Selenium Speed	${SPEED}

TB Logged In By Admin User
	Open Browser To Landing Page
	Change Resolution To Desktop
	Go To Login Page
	Fill Input Login Form	${USERNAME_ADMIN}	${PASSWORD_ADMIN}
	Verify Admin Page Is Visible
