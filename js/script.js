const Modal = {
    open() {
        // Open the modal (add "active" class)
        document.querySelector(".modal-overlay").classList.add("active")
    },
    close() {
        // Close the modal (remove "active" class)
        document.querySelector(".modal-overlay").classList.remove("active")
    }
}

const TransactionsLocalStorageKey = "dev.finances:transactions"

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem(TransactionsLocalStorageKey)) || []
    },

    set(transactions) {
        localStorage.setItem(TransactionsLocalStorageKey, JSON.stringify(transactions))
    },
}

const transactions = [
    {
        id: 1,
        description: "Luz",
        amount: -5010,
        date: "23/01/2021",
    },
    {
        id: 2,
        description: "Website",
        amount: 500000,
        date: "23/01/2021",
    },
    {
        id: 3,
        description: "Internet",
        amount: -20000,
        date: "23/01/2021",
    },
    {
        id: 4,
        description: "App",
        amount: 10000,
        date: "23/01/2021",
    },
]

const Transaction = {
    allTransactions: Storage.get(),

    add(transaction) {
        this.allTransactions.push(transaction)
        App.reload()
    },

    remove(index) {
        this.allTransactions.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        this.allTransactions.forEach(transaction => {
            income += transaction.amount > 0 ? transaction.amount : 0
        })
        return income
    },

    expenses() {
        let expense = 0
        this.allTransactions.forEach(transaction => {
            expense += transaction.amount < 0 ? transaction.amount : 0
        })
        return expense
    },

    total() {
        return this.incomes() + this.expenses()
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "+"
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },

    formatAmount(value) {
        return Math.round(Number(value) * 100)
    },

    formatDate(date) {
        const dateComponents = date.split("-")
        return `${dateComponents[2]}/${dateComponents[1]}/${dateComponents[0]}`
    },
}

const TransactionDOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr")
        tr.innerHTML = TransactionDOM.transactionInnerHTML(transaction, index)
        tr.dataset.index = index
        TransactionDOM.transactionsContainer.appendChild(tr)
    },

    transactionInnerHTML(transaction, index) {
        // Apply the proper class
        const cssClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const markup = `
        <td class="description">${transaction.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img
                src="assets/minus.svg"
                onclick="Transaction.remove(${index})"
                alt="Remover transação">
        </td>`

        return markup
    },

    updateBalance() {
        document.getElementById("incomeCard").innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById("expenseCard").innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById("totalCard").innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        TransactionDOM.transactionsContainer.innerHTML = ""
    },
}

const App = {
    init() {
        Transaction.allTransactions.forEach(TransactionDOM.addTransaction)

        TransactionDOM.updateBalance()

        Storage.set(Transaction.allTransactions)
    },

    reload() {
        TransactionDOM.clearTransactions()
        App.init()
    },
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        }
    },

    validateFields() {
        const { description, amount, date } = this.getValues()
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            this.validateFields()
            const transaction = this.formatValues()
            this.saveTransaction(transaction)
            this.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }


    },
}

App.init()