*** Keywords ***
TB Go To Login Page
	Go To	${WEB_BASE_URL}/login
	Wait Until Element Is Visible	${login_div_block}

TB Verify Login Failure Dialog Is Visible
	[Arguments]	${error_text}
	Wait Until Element Is Visible	${login_div_notify}	${TIMEOUT}
	${text}	Get Text	${login_div_notify_text}
	Should Be Equal	${text}	${error_text}
