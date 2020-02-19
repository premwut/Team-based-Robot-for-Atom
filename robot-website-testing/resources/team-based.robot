*** Keywords ***
TB Open Browser To Landing Page
	[Arguments]	${BROWSER}=chrome
	Open browser	${WEB_BASE_URL}	${BROWSER}
	Set Selenium Speed	${SPEED}

TB Change Resolution To Desktop
	Set Window Size	1400	860
