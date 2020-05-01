*** Keywords ***
TB Change Resolution To Tablet
	Set Window Size	800	1024

TB Fill Input Login Form
	[Arguments]	${username}	${password}
	Input Text	${login_input_username}	${username}
	Input Password	${login_input_password}	${password}
	Click Element	${login_button_submit}
	Sleep	2

TB Go To Login Page
	Go To	${WEB_BASE_URL}/login
	Wait Until Element Is Visible	${login_div_block}

TB Verify Admin Page Is Visible
	Wait Until Element Is Visible	${admin_div_container}	${TIMEOUT}
