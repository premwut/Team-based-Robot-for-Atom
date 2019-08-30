*** Settings ***
Test Teardown     Close All browsers
Resource          ${CURDIR}/../keywords/keyword.robot


*** Test Cases ***
Desktop - Login by admin success
    [Tags]    login     regression     high     desktop
    Open Browser To Landing Page
    Change Resolution To Desktop
    Go To Login Page
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
    [Tags]    login     regression     high     desktop
    Open Browser To Landing Page
    Change Resolution To Mobile
    Go To Login Page
    Simulate  ${login_input_password}  focus
    Simulate  ${login_input_username}  focus
    Element Should Be Visible    ${login_username_field_error}
    Element Should Be Visible    ${login_password_field_error}
