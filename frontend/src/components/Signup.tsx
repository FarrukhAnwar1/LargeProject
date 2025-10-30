function Signup(){
    return (
        <div className="card" id="loginDiv">
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Sign Up</strong>
            </div>
            <div className="flex">
                <div className="login-input !w-[50%] mr-1 pt-4">
                    <p className=''>First Name:</p>
                    <input
                        className='p-2'
                        type="text"
                        id="first name"
                        name="first name"
                        placeholder="First Name"
                        />
                </div>
                <div className="login-input !w-[50%] ml-1 pt-4">
                    <p className=''>Last Name:</p>
                    <input
                        className='p-2'
                        type="text"
                        id="last name"
                        name="last name"
                        placeholder="Last Name"
                        />
                </div>
            </div>
            <div className="pt-4">
                <div className="login-input !pb-0">
                Email:
                <br />
                <input
                    className="p-2"
                    type="email"
                    id="signupEmail"
                    name="email"
                    placeholder="Email"
                    />
                </div>
            </div>
            <div className="pt-4">
                <div className="login-input !pb-0">
                Password:
                <br />
                <input
                    className="p-2"
                    type="password"
                    id="signupPassword"
                    name="password"
                    placeholder="Password"
                    />
                </div>
            </div>


            <div className='pt-10'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    id="registerButton"
                    value="Do It"
                >Register Account</button>
            </div>
            <br/>
            <div className='text-center'>
                <span id="registerResult" className='font-medium'></span>
            </div>
        </div>
    );
}

export default Signup;