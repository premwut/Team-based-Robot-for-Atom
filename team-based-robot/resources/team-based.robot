*** Keywords ***
TB Open Browser To Landing Page
	[Arguments]	${BROWSER}=chrome
	Open browser	${WEB_BASE_URL}	${BROWSER}
	Set Selenium Speed	${SPEED}

TB Change Resolution To Desktop
	Set Window Size	1400	860

TB Change Resolution To Tablet
	Set Window Size	800	1024

TB Change Resolution To Mobile
	Set Window Size	375	667

TB Go To Login Page
	Go To	${WEB_BASE_URL}/login
	Wait Until Element Is Visible	${login_div_block}

TB Fill Input Login Form
	[Arguments]	${username}	${password}
	Input Text	${login_input_username}	${username}
	Input Password	${login_input_password}	${password}
	Click Element	${login_button_submit}
	Sleep	2

TB Verify Login Failure Dialog Is Visible
	[Arguments]	${error_text}
	Wait Until Element Is Visible	${login_div_notify}	${TIMEOUT}
	${text}	Get Text	${login_div_notify_text}
	Should Be Equal	${text}	${error_text}

TB Verify Admin Page Is Visible
	Wait Until Element Is Visible	${admin_div_container}	${TIMEOUT}
