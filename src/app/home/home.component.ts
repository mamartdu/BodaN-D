import { Component, ViewChild, ElementRef } from '@angular/core';
import { GoogleDriveService } from '../google-drive.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  selectedFiles: File[] = [];
  isDialogOpen: boolean = false;
  isFileSelectorOpen: boolean = false;
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private driveService: GoogleDriveService) { }

  // Método para abrir el selector de archivos (galería)
  openFileSelector(): void {
    // Abre directamente el selector de archivos haciendo clic en el input
    this.fileInput.nativeElement.click();
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
    this.isFileSelectorOpen = false;
    this.openDialog();  // Abre el pop-up para confirmar
  }

  // Método para abrir el pop-up de confirmación
  openDialog(): void {
    this.isDialogOpen = true;
  }

  // Método para cerrar el pop-up
  closeDialog(): void {
    this.isDialogOpen = false;
  }

  // Método para subir las fotos a Google Drive
  uploadPhotos(): void {
    this.isUploading = true;
    this.uploadSuccess = false;
    this.uploadError = false;

    const uploadObservables = this.selectedFiles.map(file => this.driveService.uploadFile(file));

    // Subir todas las fotos
    Promise.all(uploadObservables.map(obs => obs.toPromise()))
      .then(() => {
        this.isUploading = false;
        this.uploadSuccess = true;
        console.log('Fotos subidas exitosamente');
      })
      .catch((error) => {
        this.isUploading = false;
        this.uploadError = true;
        console.error('Error al subir las fotos', error);
      });

    // Cerrar el pop-up una vez que haya terminado
    this.closeDialog();
  }

  // Método para ver la galería (puedes agregar la lógica para mostrar imágenes)
  viewGallery(): void {
    console.log('Ver galería...');
    // Redirige o abre la galería de fotos.
  }
}
