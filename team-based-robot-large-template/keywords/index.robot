*** Settings ***
Library           Selenium2Library

# Add your locator resources
Resource          ${CURDIR}/../locators/login.locator.robot
Resource          ${CURDIR}/../locators/register.locator.robot


Resource          ${CURDIR}/common.robot
# Add youre keyword resources
Resource          ${CURDIR}/login.keyword.robot
Resource          ${CURDIR}/register.keyword.robot
