import React from "react"



function header (){

return(
    <div className=" bg-white  p-3 flex-col text-white w-full screen justify-between">
<nav className="flex space-x-230 text-black">
  <h1 className="text-2xl  ">chatbot sur la sante</h1>  
  <button className="rounded-full  border-4 transition hover:bg-gray-200 right"> s'inscrire </button>
</nav>
    </div>
)

}
export default header