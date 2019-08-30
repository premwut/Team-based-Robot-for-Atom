*** Settings ***
Library           Selenium2Library
Resource          ${CURDIR}/../locators/login.locator.robot
Resource          ${CURDIR}/../locators/admin.locator.robot

*** Keywords ***
Verify Admin Page Is Visible
    Wait Until Element Is Visible    ${admin_div_container}    ${TIMEOUT}
