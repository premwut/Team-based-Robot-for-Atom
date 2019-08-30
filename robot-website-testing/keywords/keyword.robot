*** Settings ***
Library           Selenium2Library
Resource          ${CURDIR}/../locators/user.locator.robot
Resource          ${CURDIR}/../locators/side-menu.locator.robot
Resource          ${CURDIR}/../keywords/common/common.keyword.robot
Resource          ${CURDIR}/../keywords/admin.keyword.robot
Resource          ${CURDIR}/../keywords/login.keyword.robot
Resource          ${CURDIR}/../keywords/user.keyword.robot

*** Keywords ***

Logged In By Admin User
    Open Browser To Landing Page
    Change Resolution To Desktop
    Go To Login Page
    Fill Input Login Form    ${USERNAME_ADMIN}     ${PASSWORD_ADMIN}
    Verify Admin Page Is Visible
