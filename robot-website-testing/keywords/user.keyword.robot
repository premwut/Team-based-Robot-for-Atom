*** Settings ***
Library           Selenium2Library
Resource          ${CURDIR}/../locators/user.locator.robot
Resource          ${CURDIR}/../locators/side-menu.locator.robot

*** Keywords ***
Go To User Management Page
    Go To    ${WEB_BASE_URL}/admin/users
    Wait Until Element Is Visible    ${user_div_page}

Verify User Table Is Visible
    Wait Until Element Is Visible    ${user_div_table_container}    ${TIMEOUT}

Show User Form
    Click Element    ${user_btn_add}
    Wait Until Element Is Visible    ${user_form}

Select Team In User Form
    [Arguments]    ${team}
    Input Text    ${user_input_team}    ${team}
    ${firstItemMatchingTeamLocator}    Set Variable    //div[contains(@class,'menuable__content__active')]//a
    Click Element    ${firstItemMatchingTeamLocator}

Fill Input Create User Form And Submit
    [Arguments]    ${email}    ${username}    ${firstname}    ${lastname}    ${team}
    Input Text    ${user_input_email}    ${email}
    Input Text    ${user_input_username}    ${username}
    Input Text    ${user_input_firstname}    ${firstname}
    Input Text    ${user_input_lastname}    ${lastname}
    Select Team In User Form    ${team}
    Click Element    ${user_btn_save_form}
    Wait Until Element Is Not Visible    ${user_form}    ${TIMEOUT}
