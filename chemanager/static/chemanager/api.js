// Fetch the informations containing all laboratories on site with the count of products in each lab
export async function fetchSite(){

    try {
        // try to fetch the data
        const response = await fetch(`/site`);

        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${errorData.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const data = await response.json();
        return data

    } catch(error) {
        console.error('Problem occured while fetching datas: ', error.message);
        throw error;
    }
}
