const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const { parse } = require('path')

operation()

// Main function
function operation() {

    inquirer.prompt([
        {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: ['Create Account', 'Check Balance', 'Deposit', 'Withdraw', 'Transfer', 'Exit']
        }
    ]).then((answer) => {
        const action = answer['action']

        const validChoices = {
            'Create Account': promptCreateAccount,
            'Check Balance': getAccountBalance,
            'Deposit': deposit,
            'Withdraw': withdraw,
            'Transfer': transfer,
            'Exit': exit
        }
        validChoices[action]()
        
    }).catch((err) => console.log(err))
}


// Create an account
function promptCreateAccount() {
    console.log(chalk.bgGreen.black('Thank you for chosing us!\n'))
    console.log(chalk.green('Set up your account information below:'))

    createAccount()
}

function createAccount(){ 

    inquirer.prompt([
        {
            name: 'accountName',
            message: "What is your account's name?"
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Account already existed! Choose another name:'))
            createAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`,
            '{"balance": 0}',
            function (err) {
            console.log(err)
        })

        console.log(chalk.green('Congrats! Your account has been created!\n'))
        operation()
    })
    .catch((err) => console.log(err))

}

// Deposit - Add an amount to user's account
function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: "What is your account's name?"
        }
    ])
    .then((answer) => {

        const accountName = answer['accountName']

        //Verify if account exists
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'How much do you want to deposit?'
            }
        ])
        .then((answer) => {

            const amount = answer['amount']
            
            //add an amount
            addAmount(accountName, amount)
            operation()

        })
        .catch(err => console.log(err))


    })
    .catch(err => console.log(err))

}

// Withdraw - Withdraw an amount from user's account
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: "What is your account's name?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verify if account exists
        if(!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'How much do you want to withdraw?'
            }
        ])
        .then((answer) => {
            const amount = answer['amount']

            removeFundsAmount(accountName, amount)            
        })
        .catch(err => console.log(err))        
    })
    .catch(err => console.log(err))
}

//show account balance
function getAccountBalance() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: "What is your account's name?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verify if account exist
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Hello, your account's balance is ${accountData.balance}R$\n`))
        operation()

    })
    .catch(err => console.log(err))

}

//Tranfer funds to another account
function transfer() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: "What is your account's name?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return transfer()
        }

        inquirer.prompt([
            {
                name: 'accountName2',
                message: "What account do you want to transfer for?"
            }
        ])
        .then((answer) => {   
            const accountName1 = accountName                    
            const accountName2 = answer['accountName2']
    
            if(!checkAccount(accountName2)) {
                return transfer()
            }

            // Verify if its the same account you're trying to transfer to
            if(accountName1 === accountName2) {
                console.log(chalk.bgRed.black("You can't transfer to the same account you're using, try another one!\n"))
                return transfer()
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'How much do you want to transfer?'
                }
            ])
            .then((answer) => {
                const amount = answer['amount']
    
                const account1Data = getAccount(accountName)
                const account2Data = getAccount(accountName2)
                
                // Verify if none amount has been inputed
                if(!amount) {
                    console.log(chalk.bgRed.black('An error has occured, please try again later!\n'))
                    return transfer()
                }
    
                // verify if the account's balance is lower than the amount you're trying to transfer
                if(account1Data.balance < amount) {
                    console.log(chalk.bgRed.black('Insufficient funds!\n'))
                    return transfer()
                }

                account1Data.balance = parseFloat(account1Data.balance) - parseFloat(amount)
                account2Data.balance = parseFloat(account2Data.balance) + parseFloat(amount)


                fs.writeFileSync(
                    `accounts/${accountName}.JSON`,
                    JSON.stringify(account1Data),
                    function(err) {
                        console.log(err)
                    }
                )

                fs.writeFileSync(
                    `accounts/${accountName2}.JSON`,
                    JSON.stringify(account2Data),
                    function(err) {
                        console.log(err)
                    }
                )

                console.log(chalk.green(`${amount}R$ has successfully been transfered from your account!\n`))
                operation()

    
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err)) 
    })
    .catch(err => console.log(err)) 

}

// Helpers
function checkAccount(accountName) {

    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black("This account doesn't exist! Please type a valid one.\n"))
        return false
    }

    return true

}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('An error has occurred, please try again later!\n'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`${amount}R$ has been deposit on your account!\n`))

}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function removeFundsAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('An error has occurred, try again later!\n'))
        return withdraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Insufficient funds!\n'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.JSON`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`${amount}R$ has successfully been withdraw from your account!\n`))
    operation()

}

function exit() {
    console.log(chalk.bgBlue.black('Thank you for using Accounts!\n'))
    process.exit()
}

function transferFunds(accountName1, accountName2, amount) {
    
}