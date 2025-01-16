import { editUser, changePassword, deleteBox, createBox } from "./api.js";
import { showAlert, updateUnclassifiedBox, createUnclassified } from "./helpers.js";

document.addEventListener('DOMContentLoaded', async () => {

    // declare the query selector
    const editButton = document.querySelector('#editButton');
    const confirmButton = document.querySelector('#confirmButton');
    const cancelButton = document.querySelector('#cancelButton');
    const usernameTitle = document.querySelector('#usernameTitle');
    const submitPasswordButton = document.querySelector('#submitPasswordButton');
    const boxTableBody = document.querySelector('#boxTable');
    const newBowInput = document.querySelector('#newBoxInput');
    const newBoxSubmit = document.querySelector('#newBoxSubmit');
    
    // group selection
    const infos = document.querySelectorAll('.info');
    const editArea = document.querySelectorAll('.edit-area');
    const editButtons = document.querySelectorAll('.edit-buttons');
    const passwordInputs = document.querySelectorAll('.passwordInput');
    const boxRows = document.querySelectorAll('.box-row');

    // get the user lab id
    const userLabId = usernameTitle.dataset.userlabid;


    // Edit button: event listener
    editButton.addEventListener('click', () => {
        infos.forEach(info => info.toggleAttribute('hidden'));
        editArea.forEach(edit => edit.toggleAttribute('hidden'));
        editButtons.forEach(button => button.toggleAttribute('hidden'));
    });


    // Cancel button: event listener
    cancelButton.addEventListener('click', () => {
        infos.forEach(info => info.toggleAttribute('hidden'));
        editArea.forEach(edit => edit.toggleAttribute('hidden'));
        editButtons.forEach(button => button.toggleAttribute('hidden'));
    })


    // confirm button: event listener to fetch the API and PUT the new datas in the db
    confirmButton.addEventListener('click', async () => {
        
        // fetch data as a json object
        const data = {
            'username': editArea[0].value,
            'labNumber': editArea[1].value,
            'email': editArea[2].value,
        }
        
        // call the api to update the data
        try{
            await editUser(data);

            // if the laboratory if modified, reload the page to update the table
            if (infos[1].innerHTML !== data['labNumber']){
                location.reload();
            }

            // update the displayed value for the updated value
            infos[0].innerHTML = data.username;  
            infos[1].innerHTML = data.labNumber !== "" ? data.labNumber : "No laboratory";
            infos[2].innerHTML = data.email; 
            usernameTitle.innerHTML = data.username;
           
            showAlert('Your account data have been successfully updated!', 'success')
        } catch (error) {
            console.error(error);
            showAlert(`Impossible to update data: ${error.message}`, 'danger')

            // finally display the correct view
        } finally {
            infos.forEach(info => info.toggleAttribute('hidden'));
            editArea.forEach(edit => edit.toggleAttribute('hidden'));
            editButtons.forEach(button => button.toggleAttribute('hidden'));
        }
    });


    // Password confirm button: event listener to fetch the API and close the modal
    submitPasswordButton.addEventListener('click', async (event) => {
        
        // fetch data as a json object
        const data = {
            'currentPassword': passwordInputs[0].value,
            'newPassword': passwordInputs[1].value,
            'confirmation': passwordInputs[2].value,
        }

        if (data['newPassword'] !== data['confirmation']) {
            showAlert('Confirmation does not match your new password', 'danger');
            return;
        } else if (Object.values(data).some(value => !value.trim())){
            showAlert('One of the required field is empty', 'danger');
            return;
        }
        
         // call the api to update the password
         try{
            await changePassword(data);
            showAlert('Your password have been successfully updated!', 'success');

            // close the modal
            const modalElement = document.getElementById('passwordModal');
            const modal = bootstrap.Modal.getInstance(modalElement); 
            modal.hide(); 

        } catch (error) {
            console.error(error);
            showAlert(`Impossible to update data: ${error.message}`, 'danger')
        } 
    });


    // Delete box buttons event listener
    boxRows.forEach(boxRow => {
        const deleteBoxButton = boxRow.querySelector('.delete-box')

        deleteBoxButton.addEventListener('click', async () => {

            const boxId = boxRow.dataset.boxid;
            const boxCount = boxRow.dataset.boxcount;
            
            try{
                await deleteBox(boxId);

                // display a success message and delete the row
                showAlert(`Box successfully deleted! All remaining products have been transfered to the 'Unclassified' box`, 'success');
                const unclassifiedPresent = updateUnclassifiedBox(boxCount, boxRows);
                boxRow.remove();

                // Add the unclassified row if not already build
                if (!unclassifiedPresent){
                    const newUnclassifiedRow = createUnclassified(boxCount);
                    boxTableBody.append(newUnclassifiedRow);
                }

            } catch (error) {
                console.error(error);
                showAlert(`Impossible to delete the box: ${error.message}`, 'danger')
            }
        });
    });


    // Event listener: box button validation
    newBoxSubmit.addEventListener('click', async () => {
        
        // get the datas
        const data = {
            'labId': userLabId,
            'boxNumber': newBowInput.value
        }

        try{
            await createBox(data);

            // reload the page
            location.reload();

        } catch (error) {
            console.error(error);
            showAlert(`Impossible to delete the box: ${error.message}`, 'danger')
        }
    })

});