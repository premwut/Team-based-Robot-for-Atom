*** Keywords ***
Open Browser To Landing Page
    [Arguments]    ${BROWSER}=chrome
    Open browser    ${WEB_BASE_URL}    ${BROWSER}
    Set Selenium Speed    ${SPEED}

Change Resolution To Desktop
    Set Window Size    1400    860

Change Resolution To Tablet
    Set Window Size    800    1024

Change Resolution To Mobile
    Set Window Size    375    667

Go To Login Page
    Go To    ${WEB_BASE_URL}/login
    Wait Until Element Is Visible    ${login_div_block}

Fill Input Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${login_input_username}    ${username}
    Input Password    ${login_input_password}    ${password}
    Click Element    ${login_button_submit}
    Sleep    2
