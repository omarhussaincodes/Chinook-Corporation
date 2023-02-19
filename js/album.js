const baseUrl = "http://localhost:4000";

const targetDiv = document.querySelector(".target");
let tableBody = document.getElementById("table-body");

getAlbums();

function getAlbums() {
    const result = fetch(`${baseUrl}/albums`, {
        method: 'GET',
    })
        .then(res => res.json());

    result.then(albums => {
        if(albums) {
            displayAlbumTable(albums);
        } else {
            console.log("Ooops! something went wrong!");
        }

    });
};

function displayAlbumTable(albums) {
    albums.forEach((album) => {
        tableBody.innerHTML += createTableRowTemplate(album);
    });
}

const createTableRowTemplate = (album) => {
    return `
              <tr>
                  <td>${album.Album.AlbumName}</td>
                  <td>${album.Artist.Artist || "N/A"}</td>
              </tr>
      `;
}
