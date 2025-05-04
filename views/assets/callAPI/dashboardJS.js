async function fetchProfit(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data.profit; // Assuming the response has a 'profit' field
}

async function displayProfits() {
    const todaysProfit = await fetchProfit("/transactions/calculateTodaysProfit");
    const yesterdaysProfit = await fetchProfit("/transactions/calculateYesterdaysProfit");
    const last7DaysProfit = await fetchProfit("/transactions/calculateLast7DaysProfit");
    const thisMonthsProfit = await fetchProfit("/transactions/calculateThisMonthsProfit");

    console.log(todaysProfit, yesterdaysProfit, last7DaysProfit, thisMonthsProfit);

    // Assuming the profit values are numbers, format them as currency
    // Adjust the formatting as needed
    document.getElementById('todays-money').innerHTML = `$${todaysProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('yesterdays-money').innerHTML = `$${yesterdaysProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('last7days-money').innerHTML = `$${last7DaysProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('thismonths-money').innerHTML = `$${thisMonthsProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

document.addEventListener('DOMContentLoaded', (event) => {
    displayProfits();
});