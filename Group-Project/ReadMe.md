<h1>Stack overflowers</h1>

<h2>The Note Squad <a href="https://notes-101.herokuapp.com" title="The Note Squad")>WebApp</a></h2>

<h3>Overview of Application Architecture:</h3>  

<p>&nbsp;&nbsp;&nbsp;&nbsp;Our NoteSquad Web App will be hosted with a free tier student account on Heroku. It will use amazon s3 as the filesystem for storing the notes (files) and PostgreSQL as the database for profiles and relevant information. We used bootstrap, CSS, and EJS templating for the user interface.</p>


<h3>Project Description:</h3>

<p>&nbsp;&nbsp;&nbsp;&nbsp;NoteSquad is a local student webpage for other students to exchange resources, notes, and find notetakers. This webpage will make it easier for students, especially long-distance/remote learning students, to find notetakers and study material, all in one place. </p>

<p>&nbsp;&nbsp;&nbsp;&nbsp;The students can make a profile which contains their contact information, major, and a list of their current classes. The search feature makes it easier for students to find what they’re looking for quickly, whether it be a notetaker, note taking jobs, or study material relevant to their current courses and major.</p><br><br><br>

**Deployment**

To run the NoteSquad app you must have docker installed:

1. Clone the repo.
2. Currently using our project&#39;s amazon s3 bucket for storage but will probably be disabled after complete, check the .env file and input your own AWS credentials, create a bucket called &quot;notetakers&quot; and docker will read from this and use your bucket.
3. Navigate in a terminal to the Notesquad\_FinalDraft folder in the "All project code-components" folder.
4. Type the command docker-compose up in your terminal
5. It&#39;s ready to use when the terminal input says ...   

    **[nodemon] starting `node server.js`**   
    **web\_1 | `http://localhost:3000`**   
    **web\_1 | Seems all green!!**

1. To access the login page type **localhost:3000/** into your preferred browser
2. All pages should be accessible from the login.

**Testing**

1. **Initial Login and Registration:** From the login page, Don&#39;t have an account? Click here to sign up! should take you to the registration page. The registration page has 7 fields you should have to fill out before you can **Submit** the form:

    **Username, Name, Email, University, Password, Confirm Password, Account Type**

    There are indicators at the bottom of the page that should be red when the page loads. They check if your password has the following:

    **A lowercase letter**

    **A capital (uppercase) letter**

    **A number**

    **Minimum 8 characters**

    **Password and Confirm Password Match**

    **Special Character**

    They should turn green when all conditions are met and then the submit button becomes enabled.

1. **User Profiles:** Once you have satisfied all the conditions hit submit you should be able to see your user profile. Your information from the registration page should be visible in the **Profile Info** card at the edge of the screen. The **Tour** button should grey out the page and produce a small box above all the highlighted features explaining them. You can end the tour at any time by pressing _End Tour_. You can edit your Name, Email, and University sections of your Profile Info section by clicking **Edit Profile.** You can edit one or all of the fields and they will save and display appropriately.
2. **Uploading and Reporting Documents:** To upload a document press the **Upload File** button in the PDF upload block below Profile info. Enter your major and the Course ID. You can use only upper and lowercase letters and numbers. The Course ID cannot be more than 8 characters. If you try to upload a document other than a PDF, you should be redirected to a page that says **The file must be a PDF!** To return to your user profile simply hit the back button. You can view, download, and print your PDF with the **Preview/Download** button. To report it, click **Report**. After reporting a PDF, your page should refresh and the reported PDF should be removed. There is also a delete button that only allows the original uploader, or an admin, to delete the file from the database.
3. **Search:** You can search for notes via the search bar, by typing either the major (i.e. Computer Science, Math, Biology, etc.) or the course code (i.e. CSCI3308, MATH2033, etc.) or even partials. You can use spaces. The search bar is not case sensitive. Once you hit search you should be directed to another page with the search results. If there are no search results, you should still be redirected, the page will simply not contain any notes. To save the notes, click **Save**. That should automatically redirect you to your profile. If you don&#39;t want to save any notes, the **Home** button on the Navbar should bring you back to your profile if you&#39;re still signed in. If you are not signed in it takes you to the Login page.
4. **Admin Profile:** The login credentials for the admin profile are: **`admin@email.com`** password: admin1password. Once logged in, you should be able to see all the reported notes in the **Reported Notes** section. You can still preview the notes if you&#39;d like to look at them yourself, or you can delete them by clicking **Delete**. Once they are deleted, they should also be deleted from every user&#39;s saved notes.
5. **Logging in and out, and About:** To log out of any profile, click **Logout** on the Navbar. You can log back in with the correct email and password. If you provide incorrect login information, red text should appear just above the NoteSquad copyright saying &#39;_Invalid Credentials_&#39;. The **About** button on the navbar should redirect you to a page with the NoteSquad product description and Application Architecture Overview.

**Users Included in the Database:**

Admin: **`admin@email.com`** password: admin1password   
User1: **`user1@email.com`** password: user1password   
User2: **`user2@email.com`** password: user2password   
User3: **`user3@email.com`** password: user3password   
User4: **`user4@email.com`** password: user4password
