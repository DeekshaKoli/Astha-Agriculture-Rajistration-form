document.getElementById("form").addEventListener("submit", async function(e){

    e.preventDefault();

    try{

        let courses = [];
        document.querySelectorAll(".courses input:checked").forEach(c=>{
            courses.push(c.value);
        });

        let formData = new FormData();

        formData.append("name", document.getElementById("name").value);
        formData.append("father", document.getElementById("father").value);
        formData.append("address", document.getElementById("address").value);
        formData.append("dob", document.getElementById("dob").value);
        formData.append("category", document.getElementById("category").value);
        formData.append("mobile", document.getElementById("mobile").value);
        formData.append("whatsapp", document.getElementById("whatsapp").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("occupation", document.getElementById("occupation").value);
        formData.append("fees", document.getElementById("fees").value);

        formData.append("course", JSON.stringify(courses));

        formData.append("tenthBoard", document.getElementById("tenthBoard").value);
        formData.append("tenthYear", document.getElementById("tenthYear").value);
        formData.append("tenthMarks", document.getElementById("tenthMarks").value);

        formData.append("twelfthBoard", document.getElementById("twelfthBoard").value);
        formData.append("twelfthYear", document.getElementById("twelfthYear").value);
        formData.append("twelfthMarks", document.getElementById("twelfthMarks").value);

        formData.append("aadhaar", document.getElementById("aadhaar").checked);
        formData.append("photoDoc", document.getElementById("photoDoc").checked);
        formData.append("marksheet", document.getElementById("marksheet").checked);
        formData.append("tc", document.getElementById("tc").checked);

        let file = document.getElementById("photo").files[0];
        if(file){
            formData.append("photo", file);
        }

        let res = await fetch("http://localhost:5000/register", {
            method:"POST",
            body: formData
        });

        let data = await res.json();

        alert(data.message);

        if(data.whatsapp){
            window.open(data.whatsapp, "_blank");
        }

    }catch(err){
        console.log(err);
        alert("Form error");
    }

});

// file name show
document.getElementById("photo").addEventListener("change", function(){
    let file = this.files[0];
    document.getElementById("fileName").innerText = file ? file.name : "";
});