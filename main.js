let test = {};
$.ajax({
    url: './files/2020.csv',
    dataType: 'text',
}).done(data => {
    setUpPage(data);
    return test = data
});

function setUpPage(dataRows) {
    let options = getCategories(dataRows);
    return appendCategories(options);
}

function getCategories(dataRows) {
    const data = parseCsv(dataRows);
    let categories = [];
    let rows = data.map(row =>
        row.split(','))
    rows.forEach(row => {
        categories.push(row[3]);
    })
    return categories.filter((item, i, ar) => ar.indexOf(item) === i);
}

function appendCategories(options) {
    $('#categorySelect').empty();
    $.each(options, function (i, p) {
        $('#categorySelect').append($('<option></option>').val(p).html(p));
    });
}

function getValues() {
    return {
        startDate: $("#startDate").val(),
        endDate: $("#endDate").val(),
        category: $("#categorySelect").val(),
        description: $("#descriptionSelect").val()
    }
}

function filterColumn() {
    const filters = getValues();
    const rows = parseCsv(test);
    return applyFilter(rows, filters)

}

function formatCsvDate(dateString) {
    let date = dateString.split('/');
    return `${date[2]}-${date[0]}-${date[1]}`;
}

//Date,Account,Description,Category,Check,Credit,Debit

function applyFilter(data, filters) {
    let rows = data.map(row =>
        row.split(','))

    let filteredRows = rows.filter(
        row => {
            let transactionDate = formatCsvDate(row[0]);
            let category = row[3] || "";
            let description = row[2] || "";

            if (filters.category != "Category" && filters.description.length > 0) {
                if (
                    transactionDate >= filters.startDate &&
                    transactionDate <= filters.endDate &&
                    category == filters.category || transactionDate >= filters.startDate &&
                    transactionDate <= filters.endDate &&
                    description.includes(filters.description)
                ) {
                    return row;
                }
            } else if (filters.category != "Category") {
                if (
                    transactionDate >= filters.startDate &&
                    transactionDate <= filters.endDate &&
                    category == filters.category
                ) {
                    return row;
                }
            } else if (filters.category == "Category" && filters.description.length > 0) {
                if (
                    transactionDate >= filters.startDate &&
                    transactionDate <= filters.endDate &&
                    description.includes(filters.description)
                ) {
                    return row;
                }
            } else if (
                transactionDate >= filters.startDate &&
                transactionDate <= filters.endDate

            ) {
                return row;
            }
        }
    )
    return drawTable(filteredRows);
}

function parseCsv(data) {
    return data.split(/\r?\n|\r/);
}

function run() {
    $('#results').empty();
    filterColumn()
}

function calculateTotal(data) {
    let amountsDebt = [];
    let amountsIncome = [];
    data.forEach(row => {
        if (parseInt(row[6]) < 0) {
            amountsDebt.push(parseInt(row[6]));
        }
        if (parseInt(row[5]) > 0) {
            amountsIncome.push(parseInt(row[5]));
        }
    })

    return (amountsIncome.length > 0) ?
        $("#amount").html(`
    income: $ ${amountsIncome.reduce(function (a, b) {
        return a + b;
    }, 0)} debts: $ ${amountsDebt.reduce(function (a, b) {
        return a + b;
    }, 0) * -1}
    `) : $("#amount").html(`debts: $ ${amountsDebt.reduce(function (a, b) {
        return a + b;
    }, 0) * -1}
    `)
}

function drawTable(parsedCsv) {
    var allRows = parsedCsv;
    let table = `<table>`;
    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        if (singleRow === 0) {
            table += '<thead>';
            table += '<tr>';
        } else {
            table += '<tr>';
        }
        var rowCells = allRows[singleRow]
        for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
            if (singleRow === 0) {
                table += '<th>';
                table += rowCells[rowCell];
                table += '</th>';
            } else {
                table += '<td>';
                table += rowCells[rowCell];
                table += '</td>';
            }
        }

    }
    $('#results').append(table);
    return calculateTotal(parsedCsv);
}

$("#filterBtn").click(run);