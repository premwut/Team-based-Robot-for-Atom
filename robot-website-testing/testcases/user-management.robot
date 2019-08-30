*** Settings ***
Test Teardown     Close All browsers
Resource          ${CURDIR}/../keywords/keyword.robot
Resource          ${CURDIR}/../keywords/database/db-users.keyword.robot

*** Test Cases ***
Verify user management page display table
    [Tags]    user-management     regression     high     desktop
    Logged In By Admin User
    Go To User Management Page
    Verify User Table Is Visible

Verify create new user success
    [Tags]    user-management     regression     high     desktop    create
    Logged In By Admin User
    Go To User Management Page
    Show User Form
    ${email}    Set Variable    testcreate1@test.com
    ${username}    Set Variable    testcreate1
    ${firstname}    Set Variable    testcreate
    ${lastname}    Set Variable    tester
    ${team}    Set Variable    TeamA
    Delete User By Email    ${email}
    Fill Input Create User Form And Submit    ${email}     ${username}    ${firstname}    ${lastname}    ${team}
    ${result}    Query User By Email    ${email}
    Should Be Equal    ${result[1]}    ${email}
    Should Be Equal    ${result[2]}    ${username}
