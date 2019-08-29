*** Settings ***
Test Teardown     Close All browsers
Library           Selenium2Library
Resource          ${CURDIR}/../resources/team-based.robot

*** Variables ***
${BROWSER}             		  	        Chrome
${SPEED}               		  	        0.3
${TIMEOUT}    				                15
${WEB_BASE_URL}                       https://robot-web-testing.herokuapp.com
${USERNAME_ADMIN}   		              admin
${PASSWORD_ADMIN}   		              AdminP@ssw0rd

${login_input_username}               id=username
${login_input_password}               id=password
${login_button_submit}                id=login-btn
${login_div_block}                    id=login-block
${login_div_notify}                   id=notify-error-box
${login_div_notify_text}              //div[@class='notify-error-text']
${login_username_field_error}         //*[@id="login-block"]/div/form/div[1]/div[2]/div
${login_password_field_error}         //*[@id="login-block"]/div/form/div[2]/div[2]/div

${admin_div_container}                id=page-admin


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

Verify Login Failure Dialog Is Visible
    [Arguments]    ${error_text}
    Wait Until Element Is Visible    ${login_div_notify}    ${TIMEOUT}
    ${text}     Get Text    ${login_div_notify_text}
    Should Be Equal    ${text}    ${error_text}

Verify Admin Page Is Visible
    Wait Until Element Is Visible    ${admin_div_container}    ${TIMEOUT}


*** Test Cases ***
Desktop - Login by admin success
    [Tags]    login     regression     high     desktop
    Open Browser To Landing Page
    Change Resolution To Desktop
    TB Go To Login Page
    Fill Input Login Form     ${USERNAME_ADMIN}     ${PASSWORD_ADMIN}
    Verify Admin Page Is Visible

Desktop - Login by admin failure
    [Tags]    login     regression     high     desktop
    Open Browser To Landing Page
    Change Resolution To Desktop
    Go To Login Page
    Fill Input Login Form     ${USERNAME_ADMIN}     P@ssw0rd
    Verify Login Failure Dialog Is Visible    Login Failure.

Mobile - Verify text input show required error message
    [Tags]    login     regression     high     mobile
    Open Browser To Landing Page
    Change Resolution To Mobile
    Go To Login Page
    Simulate Event  ${login_input_password}  focus
    Simulate Event  ${login_input_username}  focus
    Element Should Be Visible    ${login_username_field_error}
    Element Should Be Visible    ${login_password_field_error}
